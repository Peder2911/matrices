package main

import (
	_ "embed"
	"github.com/peder2911/matrices/pkg/matrix"
	"net/http"
)

//go:embed web/matrices/dist/index.html
var index string

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(index))
	})
	mux.HandleFunc("/api/matrix/1", func(w http.ResponseWriter, r *http.Request) {
		var data matrix.Matrix = matrix.RandomMatrix()
		w.Header().Add("Content-Type","application/json")
		w.Write([]byte(data.Serialize()))
	})
	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		panic(err)
	}
}
