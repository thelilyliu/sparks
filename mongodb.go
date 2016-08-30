package main

import (
    "strings"
    
    "gopkg.in/mgo.v2"
)

const (
    databaseName string = "sparks"
    ipAddress string = "127.0.0.1"
)

/*
  ========================================
  Basic Functions
  ========================================
*/

func mongoDBInitialization(collectionName string) (*mgo.Collection, *mgo.Session) {
    session, err := mgo.Dial(ipAddress)
    logErrorMessage(err)
    
    return session.DB(databaseName).C(collectionName), session
}

/*
  ========================================
  Insert Resume / Portfolio Functions
  ========================================
*/

func getTitleURL(title string) string {
    titleSlice := []byte(strings.ToLower(title))
    var titleURLSlice []byte
    
    for _, ch := range titleSlice {
        if ch >= 97 && ch <= 122 { // character is a letter
            titleURLSlice = append(titleURLSlice, ch) // add character to URL
        } else if ch == 32 { // character is a space
            if len(titleURLSlice) != 0 { // not an empty slice
                if titleURLSlice[len(titleURLSlice) - 1] != 45 { // if previous character is not a hypen
                    titleURLSlice = append(titleURLSlice, 45) // add hypen to URL
                }
            }
        }
    }
    
    if len(titleURLSlice) != 0 && titleURLSlice[len(titleURLSlice) - 1] == 45 { // if last character is a hypen
        titleURLSlice = titleURLSlice[:len(titleURLSlice)-1] // remove hyphen
    }
    
    return string(titleURLSlice[:])
}

func getLinkURL(title string) string {
    titleSlice := []byte(strings.ToLower(title))
    var linkURLSlice []byte
    
    for _, ch := range titleSlice {
        if ch == 32 { // character is a space
            linkURLSlice = append(linkURLSlice, 37, 50, 48) // add "%20" to slice
        } else {
            linkURLSlice = append(linkURLSlice, ch) // add character to slice
        }
    }
    
    return string(linkURLSlice[:])
}