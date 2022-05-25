package testing

func TestSoma(t *testing.T) {
	total := Soma(1, 2)
	if total != 3 {
		t.Error("Expected 3, got ", total)
	}
}
