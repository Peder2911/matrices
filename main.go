package main

import (
	_ "embed"
	"fmt"
	"math/rand"
	"net/http"
)

//go:embed web/matrices/dist/index.html
var index string

type Chunk [128][128][1]int64

func (c *Chunk) Serialize() string {
	var out string = "["
	for i, row := range c {
		out = out + "["
		for j, cell := range row {
			for _, value := range cell {
				out = out + fmt.Sprint(value)
			}
			if j < 127 {
				out = out + ","
			}
		}
		out = out + "]"
		if i < 127 {
			out = out + ","
		}

	}
	out = out + "]"
	return out
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(index))
	})
	mux.HandleFunc("/api/matrix/1", func(w http.ResponseWriter, r *http.Request) {
		var data Chunk
		for i := 0; i < 128; i++ {
			for j := 0; j < 128; j++ {
				data[i][j][0] = int64(rand.Intn(32))
			}
		}
		w.Header().Add("Content-Type","application/json")
		w.Write([]byte(data.Serialize()))
	})
	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		panic(err)
	}
}
