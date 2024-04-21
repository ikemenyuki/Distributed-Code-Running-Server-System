package com.example;

import org.junit.Test;
import static org.junit.Assert.assertEquals;

public class CalculatorTest {
    @Test
    public void testAdd() {
        Calculator calculator = new Calculator();
        assertEquals(2, calculator.add(1, 1));
    }

    @Test
    public void testSubtract() {
        Calculator calculator = new Calculator();
        assertEquals(0, calculator.subtract(1, 1));
    }
}
