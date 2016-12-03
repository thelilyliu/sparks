package main

import (
	"image"
	"image/jpeg"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/disintegration/imaging"
	"gopkg.in/mgo.v2/bson"
)

/*
  ========================================
  Image
  ========================================
*/

func processResumeImage(r *http.Request, categoryInt int, resumeID, userID string) (string, error) {
	var err error

	fileName := time.Now().Format("20060102150405") + ".jpg"

	file, _, err := r.FormFile("uploadFile")
	defer file.Close()
	if err != nil {
		log.Println("process image error 1:", err)
	}

	originalImage, _, err := image.Decode(file) // decode file
	if err != nil {
		log.Println("process image error 2:", err)
	}

	switch categoryInt {
	case 1: // resume profile
		/*
		  ========================================
		  Large Image
		  ========================================
		*/

		// Step 1: Resize image to width = 1200 px.
		largeFilePath := "./images/profile/large/"
		imageLarge := imaging.Resize(originalImage, 1200, 0, imaging.Linear)

		// Step 2: Save image in directory.
		largeFile, err := os.Create(largeFilePath + fileName)
		defer largeFile.Close()
		if err != nil {
			log.Println("process image error 3:", err)
		}

		// Step 3: Compress image.
		err = jpeg.Encode(largeFile, imageLarge, &jpeg.Options{90})
		if err != nil {
			log.Println("process image error 4:", err)
		}

		/*
		  ========================================
		  Small Image
		  ========================================
		*/

		// Step 4: Resize image to width = 600 px.
		smallFilePath := "./images/profile/small/"
		imageSmall := imaging.Resize(originalImage, 600, 0, imaging.Linear)

		// Step 5: Save image in directory.
		smallFile, err := os.Create(smallFilePath + fileName)
		defer smallFile.Close()
		if err != nil {
			log.Println("process image error 5:", err)
		}

		// Step 6: Compress image.
		err = jpeg.Encode(smallFile, imageSmall, &jpeg.Options{90})
		if err != nil {
			log.Println("process image error 6:", err)
		}

		/*
		  ========================================
		  Update Database
		  ========================================
		*/

		// Step 7: Get image file name from database.
		resume := new(Resume)
		selector := bson.M{"profile.background": 1}
		err = getRFileName(resumeID, userID, &selector, resume)
		if err != nil {
			log.Println("process image error 7:", err)
		}

		// Step 8: Save image file name in resume database.
		err = updateRBackground(resumeID, userID, fileName)
		if err != nil {
			log.Println("process image error 8:", err)
		}

		// Step 9: Save image file name in user database.
		err = updateUResumeBackground(resumeID, userID, fileName)
		if err != nil {
			log.Println("process image error 9:", err)
		}

		// Step 10: Delete old large image from directory.
		err = os.Remove(largeFilePath + resume.Profile.Background)
		if err != nil {
			log.Println("process image error 10:", err)
		}

		// Step 11: Delete old small image from directory.
		err = os.Remove(smallFilePath + resume.Profile.Background)
		if err != nil {
			log.Println("process image error 11:", err)
		}
	case 2: // experience
	case 3: // skills
	case 4: // achievements
	case 5: // contact
	default:
		log.Println("Process upload file category not matched.")
	}

	return fileName, err
}

func processPortfolioImage(r *http.Request, categoryInt int, portfolioID, userID string) (string, error) {
	var err error

	fileName := time.Now().Format("20060102150405") + ".jpg"

	file, _, err := r.FormFile("uploadFile")
	defer file.Close()
	if err != nil {
		log.Println("process image error 1:", err)
	}

	originalImage, _, err := image.Decode(file) // decode file
	if err != nil {
		log.Println("process image error 2:", err)
	}

	switch categoryInt {
	case 1: // portfolio background
		/*
		  ========================================
		  Large Image
		  ========================================
		*/

		// Step 1: Resize image to width = 1200 px.
		largeFilePath := "./images/portfolio/large/"
		imageLarge := imaging.Resize(originalImage, 1200, 0, imaging.Linear)

		// Step 2: Save image in directory.
		largeFile, err := os.Create(largeFilePath + fileName)
		defer largeFile.Close()
		if err != nil {
			log.Println("process image error 3:", err)
		}

		// Step 3: Compress image.
		err = jpeg.Encode(largeFile, imageLarge, &jpeg.Options{90})
		if err != nil {
			log.Println("process image error 4:", err)
		}

		/*
		  ========================================
		  Small Image
		  ========================================
		*/

		// Step 4: Resize image to width = 600 px.
		smallFilePath := "./images/portfolio/small/"
		imageSmall := imaging.Resize(originalImage, 600, 0, imaging.Linear)

		// Step 5: Save image in directory.
		smallFile, err := os.Create(smallFilePath + fileName)
		defer smallFile.Close()
		if err != nil {
			log.Println("process image error 5:", err)
		}

		// Step 6: Compress image.
		err = jpeg.Encode(smallFile, imageSmall, &jpeg.Options{90})
		if err != nil {
			log.Println("process image error 6:", err)
		}

		/*
		  ========================================
		  Update Database
		  ========================================
		*/

		// Step 7: Get image file name from database.
		portfolio := new(Portfolio)
		selector := bson.M{"background": 1}
		err = getPFileName(portfolioID, userID, &selector, portfolio)

		if err != nil {
			log.Println("process image error 7:", err)
		}

		// Step 8: Save image file name in resume database.
		err = updatePBackground(portfolioID, userID, fileName)
		if err != nil {
			log.Println("process image error 8:", err)
		}

		// Step 9: Save image file name in user database.
		err = updateUPortfolioBackground(portfolioID, userID, fileName)
		if err != nil {
			log.Println("process image error 9:", err)
		}

		// Step 10: Delete old large image from directory.
		err = os.Remove(largeFilePath + portfolio.Background)
		if err != nil {
			log.Println("process image error 10:", err)
		}

		// Step 11: Delete old small image from directory.
		err = os.Remove(smallFilePath + portfolio.Background)
		if err != nil {
			log.Println("process image error 11:", err)
		}
	default:
		log.Println("Process upload file category not matched.")
	}

	return fileName, err
}
