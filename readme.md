# daq desktop/mobile website and tools

## Development

### Front end

1. npm install
1. bower install
1. grunt build-stage (i think puts the files into the api folder)

### Back end

1. duplicate `secrets.template.config` to `secrets.*.config` or `development`, `staging`, and `production` filling out the values
1. duplicate `connections.template.config` to `connections.config` filling out the values

### Deploy notes

1. grunt bump-only:###
1. update change log
1. grunt build-stage
1. web deploy from visual studio
