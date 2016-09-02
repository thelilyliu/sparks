package main

import (
    "gopkg.in/mgo.v2/bson"
)

type Portfolio struct {
    PortfolioID string      `json:"portfolioID"`
    UserID      string      `json:"userID"`
    Date        string      `json:"date"`
    Title       string      `json:"title"`
    Blurb       string      `json:"blurb"`
    TitleURL    string      `json:"titleURL"`
    LinkURL     string      `json:"linkURL"`
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
    collection, session := mongoDBInitialization("resume")
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

func insertPortfolioDB() {
    // create new MongoDB session
    // collection, session := mongoDBInitialization("portfolio")
    // defer session.Close()
    
    // insert portfolioID, portfolioTitle, and portfolioDate into User struct
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
	logErrorMessage(err)
    
    return err
}