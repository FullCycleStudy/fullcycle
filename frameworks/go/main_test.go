package main

func TestSoma(t *testing.T) {
	total := Soma(1, 2)
	if total != 3 {
		t.Error("Expected 3, got ", Soma(1, 2))
	}
}
