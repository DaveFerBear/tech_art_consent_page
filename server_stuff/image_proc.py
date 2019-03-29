import cv2
from gcp_utils import *

raw_img_folder = 'raw/'
processed_img_folder = 'processed/'

def process_image(filename, did_consent):

	face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

	img = cv2.imread(raw_img_folder+filename)
	gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

	if not(did_consent):
		img = gray
	else:
		faces = face_cascade.detectMultiScale(gray, 1.3, 5)
		if faces is not None and len(faces) > 0:
			(x, y, w, h) = faces[0]
			cv2.rectangle(img, (x,y),(x+w,y+h), (0,0,255), 2)

	cv2.imwrite(processed_img_folder+filename, img)

def main():
	process_image('consented.jpg', True)
	process_image('not_consented.jpg', False)

if __name__ == '__main__':
	# This will be triggered automatically (user id will be known on file upload).
	user_id = 1522

	did_consent = fetch_user_consent_preferences(user_id)

	files = fetch_images_and_save(user_id)
	for f in files:
		process_image(f, True)
