
package matrix

import (
	"fmt"
	"math/rand"
)

type Matrix[128][128]int64

func (c *Matrix) Serialize() string {
	var out string = "["
	for i, row := range c {
		out = out + "["
		for j, cell := range row {
			out = out + fmt.Sprint(cell)
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

func RandomMatrix() Matrix {
	var mat Matrix
	for i := 0; i < 128; i++ {
		for j := 0; j < 128; j++ {
			mat[i][j] = int64(rand.Intn(32))
		}
	}
	return mat
}
