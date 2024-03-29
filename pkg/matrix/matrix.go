
package matrix

import (
	"fmt"
	"math/rand"
)
const MATSIZE=32

type Matrix[MATSIZE][MATSIZE]int64

// Serialize the matrix into JSON. 
//
// Decided to write my own serializer since I thought it would be a little more
// performant..
func (c *Matrix) Serialize() string {
	lim := MATSIZE-1
	var out string = "["
	for i, row := range c {
		out = out + "["
		for j, cell := range row {
			out = out + fmt.Sprint(cell)
			if j < lim {
				out = out + ","
			}
		}
		out = out + "]"
		if i < lim {
			out = out + ","
		}

	}
	out = out + "]"
	return out
}

// Create a matrix filled with random integers between 0 and max.
func RandomMatrix(max int) Matrix {
	var mat Matrix
	for i := 0; i < MATSIZE; i++ {
		for j := 0; j < MATSIZE; j++ {
			mat[i][j] = int64(rand.Intn(max))
		}
	}
	return mat
}
