#!/usr/bin/env python
# * coding: utf8 *
'''
pallet_test.py

A module that tests the methods of the pallet_test
'''


import unittest
from datetime import date
from DaqExpireAttachmentsPallet import DaqExpireAttachmentsPallet as Patient
from json import load
from os.path import abspath
from os.path import dirname
from os.path import join

test_data = join(dirname(abspath(__file__)), 'attachments.json')


class Tests(unittest.TestCase):
    def setUp(self):
        self.patient = Patient()
        self.patient.today = date(2017, 03, 23)

    def test_expiration(self):
        not_app_managed_get_deleted = ['x.pdf', 'xx.pdf', 'xasdfazx.pdf']
        still_good = ['x03-23xfile-name.pdf', 'x03-22xfile-namex.pdf', 'x03-21xfile-namex-1-1-1x.pdf']
        rotten = ['x01-23xfile-name.pdf', 'x01-22xfile-namex.pdf', 'x01-21xfile-namex-1-1-1x.pdf']

        expired = [True for x in range(3)]
        fresh = [False for x in range(3)]

        self.assertEqual([self.patient.is_expired(bad) for bad in not_app_managed_get_deleted], expired)
        self.assertEqual([self.patient.is_expired(good) for good in still_good], fresh)
        self.assertEqual([self.patient.is_expired(bad) for bad in rotten], expired)

    def test_filter_rotten(self):
        with open(test_data) as f:
            items = load(f)

        expired = self.patient.filter_rotten(items)

        self.assertEqual(len(expired), 17)

    def test_remove_rotten(self):
        with open(test_data) as f:
            items = load(f)

        expired = self.patient.filter_rotten(items)
        url = self.patient.remove_rotten(expired[0], 'token')

        self.assertEqual(url, 'https://services2.arcgis.com/NnxP4LZ3zX8wWmP9/ArcGIS/rest/services/2015_OGFacilities/FeatureServer/0/3555/attachments/1')

    def test_pluck_parts(self):
        sample_url = 'https://services2.arcgis.com/NnxP4LZ3zX8wWmP9/ArcGIS/rest/services/2015_OGFacilities/FeatureServer/0/3555/attachments/1'
        id, attachment = self.patient.pluck_parts(sample_url)

        self.assertEqual('3555', id)
        self.assertEqual('1', attachment)
