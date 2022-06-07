package main

import "testing"
import (
	Package "./packages"
)

func TestSoma(t *testing.T) {
	total := Package.Soma(1, 2)
	if total != 3 {
		t.Error("Expected 3, got ", total)
	}
}
