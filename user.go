package main

import (
	// "log"
	"time"

	"gopkg.in/mgo.v2/bson"
)

type User struct {
	UserID        string           `json:"userID"`
	ResumeInfo    []BasicResume    `json:"resumeInfo"`
	PortfolioInfo []BasicPortfolio `json:"portfolioInfo"`
	Email         string           `json:"email"`
	Password      string           `json:"password"`
	FirstName     string           `json:"firstName"`
	LastName      string           `json:"lastName"`
}

type BasicResume struct {
	ResumeID string `json:"resumeID"`
	Date     string `json:"date"`
	Title    string `json:"title"`
	Preview  Image  `json:"preview"`
}

type BasicPortfolio struct {
	PortfolioID string `json:"portfolioID"`
	Date        string `json:"date"`
	Title       string `json:"title"`
	Preview     Image  `json:"preview"`
}

/*
  ========================================
  Load
  ========================================
*/

func loadDashboardResumesDB(user *User) error {
	// create new MongoDB session
	collection, session := mongoDBInitialization("user")
	defer session.Close()

	// retrieve one document with userID as selector
	selector := bson.M{"userid": user.UserID}
	projection := bson.M{"resumeinfo": 1}

	err := collection.Find(selector).Select(projection).One(user)

	return err
}

func loadDashboardPortfoliosDB(user *User) error {
	// create new MongoDB session
	collection, session := mongoDBInitialization("user")
	defer session.Close()

	// retrieve one document with userID as selector
	selector := bson.M{"userid": user.UserID}
	projection := bson.M{"portfolioinfo": 1}

	err := collection.Find(selector).Select(projection).One(user)

	return err
}

func loadSettingsDB(user *User) error {
	// create new MongoDB session
	collection, session := mongoDBInitialization("user")
	defer session.Close()

	// retrieve one document with userID as selector
	selector := bson.M{"userid": user.UserID}
	projection := bson.M{"resumeinfo": 0, "portfolioinfo": 0}

	err := collection.Find(selector).Select(projection).One(user)

	return err
}

/*
  ========================================
  Insert
  ========================================
*/

func insertUserDB() (string, error) {
	// create new MongoDB session
	collection, session := mongoDBInitialization("user")
	defer session.Close()

	user := new(User)

	// initialize fields // **** TEMPORARY HARD CODE ****
	user.UserID = bson.NewObjectId().String()          // get new ObjectId string
	user.UserID = user.UserID[13 : len(user.UserID)-2] // remove extra characters
	user.Email = "ashleycatliu@gmail.com"
	user.Password = "Aa163163"
	user.FirstName = "Ashley"
	user.LastName = "Liu"

	// insert user
	err := collection.Insert(user)

	return user.UserID, err
}

func insertUResume(userID, resumeID string) error {
	date := time.Now().Format("20060102150405")
	change := bson.M{"resumeinfo": bson.M{"resumeid": resumeID, "date": date, "title": "Untitled Resume"}}

	// find document and update fields
	selector := bson.M{"userid": userID}
	update := bson.M{"$addToSet": &change}

	err := updateUserDB(&selector, &update)

	return err
}

func insertUPortfolio(userID, portfolioID string) error {
	date := time.Now().Format("20060102150405")
	change := bson.M{"portfolioinfo": bson.M{"portfolioid": portfolioID, "date": date, "title": "Untitled Portfolio"}}

	// find document and update fields
	selector := bson.M{"userid": userID}
	update := bson.M{"$addToSet": &change}

	err := updateUserDB(&selector, &update)

	return err
}

/*
  ========================================
  Update
  ========================================
*/

func updateUserDB(selector, update *bson.M) error {
	// create new MongoDB session
	collection, session := mongoDBInitialization("user")
	defer session.Close()

	err := collection.Update(selector, update)

	return err
}

func updateUSettings(user *User) error {
	change := bson.M{"email": user.Email, "firstname": user.FirstName, "lastname": user.LastName, "password": user.Password}

	// find document and update fields
	selector := bson.M{"userid": user.UserID}
	update := bson.M{"$set": &change}

	err := updateUserDB(&selector, &update)

	return err
}

func updateUResume(userID string, basicResume *BasicResume) error {
	change := bson.M{"resumeinfo.$.title": basicResume.Title}

	// find document and update fields
	selector := bson.M{"userid": userID, "resumeinfo": bson.M{"$elemMatch": bson.M{"resumeid": basicResume.ResumeID}}}
	update := bson.M{"$set": &change}

	err := updateUserDB(&selector, &update)

	return err
}

func updateUPortfolio(userID string, basicPortfolio *BasicPortfolio) error {
	change := bson.M{"portfolioinfo.$.title": basicPortfolio.Title}

	// find document and update fields
	selector := bson.M{"userid": userID, "portfolioinfo": bson.M{"$elemMatch": bson.M{"portfolioid": basicPortfolio.PortfolioID}}}
	update := bson.M{"$set": &change}

	err := updateUserDB(&selector, &update)

	return err
}

/*
  ========================================
  Delete
  ========================================
*/

func deleteUResume(userID, resumeID string) error {
	change := bson.M{"resumeinfo": bson.M{"resumeid": resumeID}}

	// find document and delete resume info element from array
	selector := bson.M{"userid": userID}
	update := bson.M{"$pull": &change}

	err := updateUserDB(&selector, &update)

	return err
}

func deleteUPortfolio(userID, portfolioID string) error {
	change := bson.M{"portfolioinfo": bson.M{"portfolioid": portfolioID}}

	// find document and delete portfolio info element from array
	selector := bson.M{"userid": userID}
	update := bson.M{"$pull": &change}

	err := updateUserDB(&selector, &update)

	return err
}
