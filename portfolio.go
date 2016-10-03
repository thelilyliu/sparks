package main

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

type Portfolio struct {
	PortfolioID string      `json:"portfolioID"`
	UserID      string      `json:"userID"`
	Date        string      `json:"date"`
	Title       string      `json:"title"`
	Headline    string      `json:"headline"`
	Intro       string      `json:"intro"`
	TitleURL    string      `json:"titleURL"`
	LinkURL     string      `json:"linkURL"`
	ThemeID     string      `json:"themeID"`
	ThemeName   string      `json:"themeName"`
	Content     string      `json:"content"`
	Components  []Component `json:"components"` // not used right now
	Background  Image       `json:"background"`
}

type Component struct {
	Category int    `json:"category"`
	Content  string `json:"content"`
	Order    int    `json:"order"`
}

type Image struct {
	ImageLarge string `json:"imageLarge"`
	ImageSmall string `json:"imageSmall"`
}

/*
  ========================================
  Load
  ========================================
*/

func loadPortfolioDB(portfolio *Portfolio, selector *bson.M) error {
	// create new MongoDB session
	collection, session := mongoDBInitialization("portfolio")
	defer session.Close()

	// retrieve one document with portfolioID as selector
	err := collection.Find(selector).One(portfolio)
	logErrorMessage(err)

	return err
}

/*
  ========================================
  Insert
  ========================================
*/

func insertPortfolioDB(userID string) (string, error) {
	// create new MongoDB session
	collection, session := mongoDBInitialization("portfolio")
	defer session.Close()

	portfolio := new(Portfolio)

	// initialize fields
	portfolio.PortfolioID = bson.NewObjectId().String()                              // get new ObjectId string
	portfolio.PortfolioID = portfolio.PortfolioID[13 : len(portfolio.PortfolioID)-2] // remove extra characters
	portfolio.UserID = userID
	portfolio.Date = time.Now().Format("20060102150405")
	portfolio.Title = "Untitled Portfolio"

	// insert portfolio
	err := collection.Insert(portfolio)

	return portfolio.PortfolioID, err
}

/*
  ========================================
  Update
  ========================================
*/

func updatePortfolioDB(selector, update *bson.M) error {
	// create new MongoDB session
	collection, session := mongoDBInitialization("portfolio")
	defer session.Close()

	err := collection.Update(selector, update)

	return err
}

func updatePSettings(portfolioID, userID string, portfolio *Portfolio) error {
	change := bson.M{"title": portfolio.Title, "titleurl": portfolio.TitleURL, "linkurl": portfolio.LinkURL}

	// find document and update fields
	selector := bson.M{"portfolioid": portfolioID, "userid": userID}
	update := bson.M{"$set": &change}

	err := updatePortfolioDB(&selector, &update)

	return err
}

func updatePHeader(portfolio *Portfolio) error {
	change := bson.M{"headline": portfolio.Headline, "intro": portfolio.Intro}

	// find document and update fields
	selector := bson.M{"portfolioid": portfolio.PortfolioID, "userid": portfolio.UserID}
	update := bson.M{"$set": &change}

	err := updatePortfolioDB(&selector, &update)

	return err
}

func updatePContent(portfolioID, userID, content string) error {
	change := bson.M{"content": content}

	// find document and update fields
	selector := bson.M{"portfolioid": portfolioID, "userid": userID}
	update := bson.M{"$set": &change}

	err := updatePortfolioDB(&selector, &update)

	return err
}

/*
  ========================================
  Delete
  ========================================
*/

func deletePortfolioDB(portfolioID, userID string) error {
	// create new MongoDB session
	collection, session := mongoDBInitialization("portfolio")
	defer session.Close()

	// find document and delete resume
	selector := bson.M{"portfolioid": portfolioID, "userid": userID}
	err := collection.Remove(selector)

	return err
}
