import { Calculator, X } from 'lucide-react';
import { useState } from 'react';

export default function CalculatorButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [display, setDisplay] = useState('0');
    const [currentValue, setCurrentValue] = useState('0');
    const [operator, setOperator] = useState(null);
    const [previousValue, setPreviousValue] = useState(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);

    const handleNumber = (num) => {
        if (waitingForOperand) {
            setDisplay(String(num));
            setCurrentValue(String(num));
            setWaitingForOperand(false);
        } else {
            const newValue = display === '0' ? String(num) : display + num;
            setDisplay(newValue);
            setCurrentValue(newValue);
        }
    };

    const handleDecimal = () => {
        if (waitingForOperand) {
            setDisplay('0.');
            setCurrentValue('0.');
            setWaitingForOperand(false);
        } else if (display.indexOf('.') === -1) {
            setDisplay(display + '.');
            setCurrentValue(display + '.');
        }
    };

    const handleOperator = (nextOperator) => {
        const inputValue = parseFloat(currentValue);

        if (previousValue === null) {
            setPreviousValue(inputValue);
        } else if (operator) {
            const result = calculate(previousValue, inputValue, operator);
            setDisplay(String(result));
            setCurrentValue(String(result));
            setPreviousValue(result);
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    };

    const calculate = (firstValue, secondValue, operator) => {
        switch (operator) {
            case '+':
                return firstValue + secondValue;
            case '-':
                return firstValue - secondValue;
            case '×':
                return firstValue * secondValue;
            case '÷':
                return secondValue !== 0 ? firstValue / secondValue : 0;
            case '%':
                return firstValue % secondValue;
            default:
                return secondValue;
        }
    };

    const handleEquals = () => {
        const inputValue = parseFloat(currentValue);

        if (operator && previousValue !== null) {
            const result = calculate(previousValue, inputValue, operator);
            setDisplay(String(result));
            setCurrentValue(String(result));
            setPreviousValue(null);
            setOperator(null);
            setWaitingForOperand(true);
        }
    };

    const handleClear = () => {
        setDisplay('0');
        setCurrentValue('0');
        setOperator(null);
        setPreviousValue(null);
        setWaitingForOperand(false);
    };

    const handleBackspace = () => {
        if (!waitingForOperand) {
            const newValue = display.length > 1 ? display.slice(0, -1) : '0';
            setDisplay(newValue);
            setCurrentValue(newValue);
        }
    };

    const handleSquareRoot = () => {
        const value = parseFloat(currentValue);
        const result = Math.sqrt(value);
        setDisplay(String(result));
        setCurrentValue(String(result));
        setWaitingForOperand(true);
    };

    const handleSquare = () => {
        const value = parseFloat(currentValue);
        const result = value * value;
        setDisplay(String(result));
        setCurrentValue(String(result));
        setWaitingForOperand(true);
    };

    return (
        <>
            <li>
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 rounded-[5px] bg-primary px-4 py-2 font-medium text-white shadow-md transition-colors hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80"
                >
                    <Calculator className="h-5 w-5" />
                    Calculation
                </button>
            </li>

            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                    <div className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: '#e5e7eb' }}>
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                            style={{ backgroundColor: '#9ca3af', color: '#374151' }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6b7280')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#9ca3af')}
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Display */}
                        <div className="mb-5 rounded-lg px-5 py-6 shadow-sm" style={{ backgroundColor: '#ffffff' }}>
                            <div className="min-h-[48px] text-left text-4xl font-bold" style={{ color: '#111827' }}>
                                {display}
                            </div>
                        </div>

                        {/* Calculator Buttons */}
                        <div className="grid grid-cols-4 gap-3">
                            {/* Row 1 - Function buttons */}
                            <button
                                onClick={() => {}}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#64748b', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#64748b')}
                            >
                                (
                            </button>
                            <button
                                onClick={() => {}}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#64748b', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#64748b')}
                            >
                                )
                            </button>
                            <button
                                onClick={handleSquareRoot}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#64748b', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#64748b')}
                            >
                                √
                            </button>
                            <button
                                onClick={handleSquare}
                                className="rounded-xl py-4 text-lg font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#64748b', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#64748b')}
                            >
                                x²
                            </button>

                            {/* Row 2 - Clear, backspace, ans, divide */}
                            <button
                                onClick={handleClear}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
                            >
                                C
                            </button>
                            <button
                                onClick={handleBackspace}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#f97316', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ea580c')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f97316')}
                            >
                                ⌫
                            </button>
                            <button
                                onClick={handleEquals}
                                className="rounded-xl py-4 text-sm font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#64748b', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#64748b')}
                            >
                                Ans
                            </button>
                            <button
                                onClick={() => handleOperator('÷')}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#64748b', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#64748b')}
                            >
                                ÷
                            </button>

                            {/* Row 3 - 7, 8, 9, multiply */}
                            <button
                                onClick={() => handleNumber(7)}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#475569', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                            >
                                7
                            </button>
                            <button
                                onClick={() => handleNumber(8)}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#475569', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                            >
                                8
                            </button>
                            <button
                                onClick={() => handleNumber(9)}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#475569', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                            >
                                9
                            </button>
                            <button
                                onClick={() => handleOperator('×')}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#64748b', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#64748b')}
                            >
                                ×
                            </button>

                            {/* Row 4 - 4, 5, 6, minus */}
                            <button
                                onClick={() => handleNumber(4)}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#475569', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                            >
                                4
                            </button>
                            <button
                                onClick={() => handleNumber(5)}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#475569', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                            >
                                5
                            </button>
                            <button
                                onClick={() => handleNumber(6)}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#475569', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                            >
                                6
                            </button>
                            <button
                                onClick={() => handleOperator('-')}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#64748b', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#64748b')}
                            >
                                -
                            </button>

                            {/* Row 5 - 1, 2, 3, plus */}
                            <button
                                onClick={() => handleNumber(1)}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#475569', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                            >
                                1
                            </button>
                            <button
                                onClick={() => handleNumber(2)}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#475569', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                            >
                                2
                            </button>
                            <button
                                onClick={() => handleNumber(3)}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#475569', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                            >
                                3
                            </button>
                            <button
                                onClick={() => handleOperator('+')}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#64748b', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#64748b')}
                            >
                                +
                            </button>

                            {/* Row 6 - percent, 0, decimal, equals */}
                            <button
                                onClick={() => handleOperator('%')}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#64748b', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#64748b')}
                            >
                                %
                            </button>
                            <button
                                onClick={() => handleNumber(0)}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#475569', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                            >
                                0
                            </button>
                            <button
                                onClick={handleDecimal}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#64748b', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#64748b')}
                            >
                                .
                            </button>
                            <button
                                onClick={handleEquals}
                                className="rounded-xl py-4 text-xl font-semibold shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#22c55e')}
                            >
                                =
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
