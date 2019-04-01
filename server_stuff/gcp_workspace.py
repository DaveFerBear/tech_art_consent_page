import requests
import os
import cv2

BASE_URL = 'https://www.googleapis.com/storage/v1/b/gene499-bucket-v2/o/'
min_face_width = 100
min_face_height = 100
avg_face_width = 160
avg_face_height = 160

def fetch_blob_through_medialink(url):
    print("FETCHING BLOB: {}".format(url))
    r1 = requests.get(url=url)
    link = r1.json()['mediaLink']
    r2 = requests.get(url=link, allow_redirects=True)
    return r2


def fetch_manifest():
    return fetch_blob_through_medialink(BASE_URL+'manifest.txt').text


def fetch_user_consent_preferences(user_id):
    manifest_csv = fetch_manifest()
    print("MANIFEST CSV: {}".format(manifest_csv))
    for line in manifest_csv.split('\n'):
        data = line.split(',')
        if int(data[0]) == user_id:
            return bool(int(data[1]))

    raise Exception(
        'User preferences fetched but user {} not in manifest.'.format(user_id))


def fetch_image_and_save(user_id, image_id):
    r = fetch_blob_through_medialink(
        BASE_URL + 'raw%2F{}%2F{}'.format(user_id, image_id))
    fname = '/tmp/raw-{}-{}.jpeg'.format(user_id, image_id)
    open(fname, 'wb').write(r.content)
    return fname


def convert_to_binary_data(filename):
    with open(filename, 'rb') as file:
        binaryData = file.read()
    return binaryData


def process_image(filename, did_consent):
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    img = cv2.imread(filename)
    height, width = img.shape[:-1]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    if not(did_consent):
        img = gray
        if (12*width < 14*height):
            access_height = (14*height - 12*width) / 14
            img = img[int(access_height/2):int(-access_height/2), :]

        new_size = (int(42), int(36))
        orig_size = tuple(img.shape[::-1])
        img = cv2.resize(img, new_size, interpolation=cv2.INTER_LINEAR)
        img = cv2.resize(img, orig_size, interpolation=cv2.INTER_NEAREST)
    else:
        faces = face_cascade.detectMultiScale(gray, 1.1, 2)
        faces = [face for face in faces if face[2] > min_face_width and face[3] > min_face_height]
        # print(faces)

        # if (len(faces) == 0):
        #     face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_alt.xml")
        #     faces = face_cascade.detectMultiScale(gray, 1.1, 1)
        #     faces = [face for face in faces if face[2] > min_face_width and face[3] > min_face_height]
        #     # print(faces)

        # if (len(faces) == 0):
        #     face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_alt2.xml")
        #     faces = face_cascade.detectMultiScale(gray, 1.1, 1)
        #     faces = [face for face in faces if face[2] > min_face_width and face[3] > min_face_height]
        #     # print(faces)

        if (len(faces) == 0):
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_alt_tree.xml")
            faces = face_cascade.detectMultiScale(gray, 1.1, 2)
            faces = [face for face in faces if face[2] > min_face_width and face[3] > min_face_height]
            # print(faces)

        if (len(faces) == 0):
            glasses_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye_tree_eyeglasses.xml")
            glasses = glasses_cascade.detectMultiScale(gray, 1.3, 3)
            # Hail mary
            if (len(glasses) == 2):
                glasses = list(glasses)
                # Sort glasses left to right
                glasses.sort(key=lambda item: item[0])
                (x1, y1, w1, h1) = glasses[0]
                (x2, y2, w2, h2) = glasses[1]
                net_width = x2+w2-x1
                if (w1 < 90 and w2 < 90 and net_width > min_face_width):
                    access_width = net_width - avg_face_width
                    faces = [[int(x1 + access_width/2), int(y1-avg_face_width/3), avg_face_width, avg_face_height]]

                for i, glass in enumerate(glasses):
                    (x, y, w, h) = glass
                    cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 4)

        if (len(faces) == 0):
            if (12*width < 14*height):
                access_height = (14*height - 12*width) / 14
                img = img[int(access_height/2):int(-access_height/2), :]

        if (len(faces) > 3):
            faces = faces[:3]

        min_diff = 100000000
        best_guy = -1
        for i, face in enumerate(faces):
            (x, y, w, h) = face
            diff = x - (width - x - w)
            # print(diff)
            if (abs(diff) < min_diff):
                best_guy = i
                min_diff = abs(diff)

        for i, face in enumerate(faces):
            (x, y, w, h) = face
            thiccness = 4
            if (i == best_guy):
                thiccness = 7
            cv2.rectangle(img, (x, y), (x+w, y+h), (0, 0, 255), thiccness)
            if (i == best_guy and 12*width < 14*height):
                access_height = (14*height - 12*width) / 14
                top_dist = y
                bottom_dist = height - y - h
                if (top_dist > access_height):
                    img = img[int(access_height):,:]
                elif (bottom_dist > access_height):
                    img = img[:int(-access_height),:]
                else:
                    img = img[int(access_height/2):int(-access_height/2), :]

    # take processed off front.
    processed_fname = '/tmp/processed-'+filename.split('/')[-1]
    cv2.imwrite(processed_fname, img)  # processed-raw-1234-1.jpeg
    return processed_fname


def upload_image(binary_data, user_id, image_id):
    file_name = "processed/" + str(user_id) + "/" + str(image_id)
    upload_endpoint = "https://www.googleapis.com/upload/storage/v1/b/gene499-bucket-v2/o"
    params = {
        'name': file_name,
        'uploadType': "media"
    }
    r = requests.post(url=upload_endpoint, data=binary_data, params=params)


def process(event, context):
    NUM_IMAGES = 5
    file_name = event['name'].split('/')
    if file_name[0] != 'manifest.txt':
        return

    m = fetch_manifest()
    m = m.split('\n')
    last_user = m[-1]
    user_id, did_consent = last_user.split(',')
    did_consent = int(did_consent)

    for image_id in range(1, NUM_IMAGES+1):
        raw_filename = fetch_image_and_save(user_id, image_id)
        processed_filename = process_image(raw_filename, did_consent)
        binary_data = convert_to_binary_data(processed_filename)

        upload_image(binary_data, user_id, image_id)


if __name__ == "__main__":
    event = {'name': 'manifest.txt'}
    process(event, None)
