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
	Intro       string      `json:"intro"`
	TitleURL    string      `json:"titleURL"`
	LinkURL     string      `json:"linkURL"`
	ThemeID     string      `json:"themeID"`
	ThemeName   string      `json:"themeName"`
	Components  []Component `json:"components"`
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

func updatePortfolioDB(portfolioID string, change *bson.M) error {
	// create new MongoDB session
	collection, session := mongoDBInitialization("portfolio")
	defer session.Close()

	// find document and update fields
	selector := bson.M{"portfolioid": portfolioID}
	update := bson.M{"$set": change}

	err := collection.Update(selector, update)

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
