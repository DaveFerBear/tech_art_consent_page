import requests
import os

BASE_URL = 'https://www.googleapis.com/storage/v1/b/gene499-bucket-v2/o/'


def fetch_blob_through_medialink(url):
    r1 = requests.get(url=url)
    link = r1.json()['mediaLink']
    r2 = requests.get(url=link, allow_redirects=True)
    return r2

def fetch_manifest():
	return fetch_blob_through_medialink(BASE_URL+'manifest').text

def fetch_user_consent_preferences(user_id):
    manifest_csv = fetch_manifest()
    for line in manifest_csv.split('\n'):
        data = line.split(',')
        if int(data[0]) == user_id:
            return bool(int(data[1]))

    raise Exception('User preferences fetched but user {} not in manifest.'.format(user_id))

def fetch_images_and_save(user_id):
    # TODO: run these requests in parallel?
    file_names = []
    for i in range(1,6):
        r = fetch_blob_through_medialink(BASE_URL + 'test_files%2F{}%2F{}'.format(user_id, i))
        fname = 'raw/{}-{}.jpeg'.format(user_id, i)
        open(fname, 'wb').write(r.content)
        file_names.append(fname)
    return file_names

