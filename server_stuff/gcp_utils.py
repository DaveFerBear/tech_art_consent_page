from google.cloud import storage

BUCKET_NAME = 'gene499-bucket-v2'
storage_client = storage.Client()
bucket = storage_client.get_bucket(BUCKET_NAME)


def upload_blob(source_file_name, destination_blob_name):
    """Uploads a file to the bucket."""
    
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(source_file_name)

    print('File {} uploaded to {}.'.format(
        source_file_name,
        destination_blob_name))

def list_blobs_with_prefix(prefix, delimiter=None):
    blobs = bucket.list_blobs(prefix=prefix, delimiter=delimiter)

    print('Blobs:')
    for blob in blobs:
        print(blob.name)

    if delimiter:
        print('Prefixes:')
        for prefix in blobs.prefixes:
            print(prefix)

def fetch_manifest():
	return