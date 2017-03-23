#!/usr/bin/env python
# * coding: utf8 *
'''
DaqExpireAttachmentsPallet.py

A module that contains a pallet to expire documents over 30 days old
'''

import re
import requests
from datetime import date
from dateutil.parser import parse
from forklift.models import Pallet
from secrets import secrets


class DaqExpireAttachmentsPallet(Pallet):
    '''A module that contains the base class that should be inherited from when building new pallet classes.
    Pallets are plugins for the forklift main process. They define a list of crates and
    any post processing that needs to happen.
    In order for a pallet to be recognized by forklift, the file within which it is defined needs to have
    `pallet` (case-insensitive) somewhere in the filename.
    Multiple pallets with the same filename will cause issues so it's strongly recommended to keep them unique.
    Appending the project name to the file name is the convention.'''

    def __init__(self, arg=None):
        super(DaqExpireAttachmentsPallet, self).__init__()

        self.token_url = 'https://www.arcgis.com/sharing/rest/oauth2/token/'
        self.replica_fragment = 'createReplica'
        self.expires_in_days = 30
        self.today = date.today()
        self.url_regex = re.compile('\/(\d*)\/attachments/(\d*)', re.I | re.M)
        self.delete_template = '0/{}/deleteAttachments'

    def ship(self):
        '''Invoked whether the crates have updates or not.
        '''
        self.log.info('acquiring token')
        token = self.get_token(secrets)

        self.log.info('requesting replica')
        attachment_info = self.get_attachment_info(token, secrets)

        bring_out_yer_dead = self.filter_rotten(attachment_info)

        [self.remove_rotten(attachment_url, token) for attachment_url in bring_out_yer_dead]

    def get_token(self, secrets):
        form = {
            'client_id': secrets['ago_user'],
            'client_secret': secrets['ago_password'],
            'expiration': '2000',
            'grant_type': 'client_credentials',
            'f': 'json'
        }

        r = requests.post(self.token_url, data=form)
        r.raise_for_status()

        response = r.json()

        try:
            error = response['error']
            raise Exception(error['message'])
        except KeyError:
            pass

        return response['access_token']

    def get_attachment_info(self, token, secrets):
        querystring = {
            'token': token,
            'f': 'json'
        }

        r = requests.get(secrets['feature_server'], params=querystring)
        r.raise_for_status()

        response = r.json()
        geom = response['fullExtent']

        form = {
            'replicaName': 'test',
            'layers': '0',
            'geometry': '{},{},{},{}'.format(geom['xmin'], geom['ymin'], geom['xmax'], geom['ymax']),
            'geometryType': 'esriGeometryEnvelope',
            'targetType': 'client',
            'transportType': 'esriTransportTypeEmbedded',
            'returnAttachments': True,
            'returnAttachmentsDatabyURL': True,
            'attachmentsSyncDirection': 'upload',
            'async': False,
            'syncModel': 'none',
            'dataFormat': 'json',
            'f': 'json',
            'token': token
        }

        r = requests.post('{}/{}'.format(secrets['feature_server'], self.replica_fragment), data=form)
        r.raise_for_status()

        response = r.json()
        attachments = response['layers'][0]['attachments']

        return attachments

    def is_expired(self, filename):
        if not filename.startswith('x'):
            return True

        parts = filename.split('x')

        #: '' parses to current date
        if len(parts) < 3 or len(parts[1]) == 0:
            return True

        try:
            creation_date = parse(parts[1])
        except ValueError:
            return True

        creation_date = date(creation_date.year, creation_date.month, creation_date.day)

        age = (self.today - creation_date).days

        return age > self.expires_in_days

    def filter_rotten(self, items):
        return [item['url'] for item in items if self.is_expired(item['name'])]

    def remove_rotten(self, url, token):
        form = {
            'f': 'json',
            'token': token
        }

        feature_id, attachment_id = self.pluck_parts(url)

        if not feature_id:
            self.log.warn('%s was not deleted. parts were not plucked', url)

        url = '{}{}'.format(secrets['feature_server'], self.delete_template.format(feature_id))
        form['attachmentIds'] = attachment_id

        r = requests.post(url, data=form)
        r.raise_for_status()

        response = r.json()

        try:
            error = response['error']
            raise Exception(error['message'])
        except KeyError:
            pass

        success = response['deleteAttachmentResults'][0]['success']
        if not success:
            self.log.warn('%s was not deleted', url)

    def pluck_parts(self, url):
        match = self.url_regex.search(url)

        if not match:
            return (None,)

        feature_id = match.group(1)
        upload_id = match.group(2)

        return (feature_id, upload_id)
