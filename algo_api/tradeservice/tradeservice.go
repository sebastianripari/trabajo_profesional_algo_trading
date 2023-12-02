package tradeservice

import (
	"algo_api/database"
	"algo_api/databaseservice"
	"encoding/json"
	"sync"
)

var instance IService
var once sync.Once

func GetInstance() IService {
	once.Do(func() {
		instance = NewService()
	})
	return instance
}

type TradeService struct {
	databaseservice databaseservice.IService
}

func NewService() IService {
	return &TradeService{
		databaseservice: databaseservice.GetInstance(),
	}
}

type IService interface {
	Create(trade map[string]interface{}) error
	Get(id string) (*database.TradePublicFields, error)
}

func (s *TradeService) Create(trade map[string]interface{}) error {
	dbName := "trades"
	db, err := s.databaseservice.GetDB(dbName)
	if err != nil {
		return err
	}
	_, _, err = db.Save(trade, nil)
	if err != nil {
		return err
	}
	return nil
}

func (s *TradeService) Get(id string) (*database.TradePublicFields, error) {
	dbName := "trades"
	db, err := s.databaseservice.GetDB(dbName)
	if err != nil {
		return nil, err
	}
	doc, err := db.Get(id, nil)
	if err != nil {
		return nil, err
	}
	bytes, err := json.Marshal(doc)
	if err != nil {
		return nil, err
	}
	var trade *database.Trade
	err = json.Unmarshal(bytes, &trade)
	if err != nil {
		return nil, err
	}
	return &trade.TradePublicFields, nil
}
