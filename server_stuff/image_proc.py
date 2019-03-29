import cv2
import os
from gcp_utils import *
from PIL import Image

raw_img_folder = 'raw/'
processed_img_folder = 'processed/'

def process_image(filename, did_consent):

	face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

	img = cv2.imread(filename)

	height, width = img.shape[:-1]

	des_height = 360
	des_width = 420

	if (12*width > 14*height):
		# Crop out middle width
		access_width = (12*width - 14*height) / 12
		img = img[:,int(access_width/2):int(-access_width/2)]
		# img = cv2.resize(img, (des_width, des_height), interpolation=cv2.INTER_LINEAR)
		
	elif (12*width < 14*height):
		# Crop out middle height
		access_height = (14*height - 12*width) / 14
		img = img[int(access_height/2):int(-access_height/2),:]
		# img = cv2.resize(img, (des_width, des_height), interpolation=cv2.INTER_LINEAR)

	gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

	if not(did_consent):
		img = gray
		new_size = (int(42), int(36))
		orig_size = tuple(img.shape[::-1])
		img = cv2.resize(img, new_size, interpolation=cv2.INTER_LINEAR)
		img = cv2.resize(img, orig_size, interpolation=cv2.INTER_NEAREST)
	else:
		faces = face_cascade.detectMultiScale(gray, 1.3, 5)
		if faces is not None and len(faces) > 0:
			(x, y, w, h) = faces[0]
			cv2.rectangle(img, (x,y),(x+w,y+h), (0,0,255), 4)

	cv2.imwrite(processed_img_folder+os.path.basename(filename), img)

def main():
	process_image(raw_img_folder+'consented.jpg', True)
	process_image(raw_img_folder+'not_consented.jpg', False)

if __name__ == '__main__':
	# This will be triggered automatically (user id will be known on file upload).
	user_id = 1522

	did_consent = fetch_user_consent_preferences(user_id)

	files = fetch_images_and_save(user_id)

	for f in files:
		process_image(f, did_consent)
