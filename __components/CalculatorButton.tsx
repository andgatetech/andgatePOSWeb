import { Calculator, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function CalculatorButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [display, setDisplay] = useState('0');
    const [fullHistory, setFullHistory] = useState('');
    const [currentValue, setCurrentValue] = useState('0');
    const [operator, setOperator] = useState(null);
    const [previousValue, setPreviousValue] = useState(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);

    const historyRef = useRef(null);

    // Scroll to end whenever fullHistory changes
    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollLeft = historyRef.current.scrollWidth;
        }
    }, [fullHistory]);

    const appendHistory = (value) => {
        setFullHistory(prev => prev + value);
    };

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
        appendHistory(num);
    };

    const handleDecimal = () => {
        if (waitingForOperand) {
            setDisplay('0.');
            setCurrentValue('0.');
            setWaitingForOperand(false);
            appendHistory('0.');
        } else if (!display.includes('.')) {
            setDisplay(display + '.');
            setCurrentValue(display + '.');
            appendHistory('.');
        }
    };

    const calculate = (first, second, op) => {
        switch (op) {
            case '+': return first + second;
            case '-': return first - second;
            case '×': return first * second;
            case '÷': return second !== 0 ? first / second : 0;
            case '%': return first % second;
            default: return second;
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

        setOperator(nextOperator);
        setWaitingForOperand(true);
        appendHistory(` ${nextOperator} `);
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
        setFullHistory('');
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
            setFullHistory(prev => prev.slice(0, -1));
        }
    };

    const handleSquareRoot = () => {
        const value = parseFloat(currentValue);
        const result = Math.sqrt(value);
        appendHistory(`√(${value})`);
        setDisplay(String(result));
        setCurrentValue(String(result));
        setWaitingForOperand(true);
    };

    const handleSquare = () => {
        const value = parseFloat(currentValue);
        const result = value * value;
        appendHistory(`${value}²`);
        setDisplay(String(result));
        setCurrentValue(String(result));
        setWaitingForOperand(true);
    };

    const btn = (label, onClick, baseColor, hoverColor) => (
        <button
            onClick={onClick}
            className="rounded-xl py-4 text-xl font-semibold shadow-md active:scale-95 text-white transition-colors"
            style={{ backgroundColor: baseColor }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = baseColor)}
        >
            {label}
        </button>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="ml-1 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white shadow-md hover:bg-primary/90"
            >
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Calculator</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
                    <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto rounded-2xl bg-gray-200 p-5 shadow-2xl">


                        {/* Close Button */}
                        <div className="flex justify-end mb-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Double Display with scrollable history */}
                        <div className="mb-4 rounded-lg bg-white px-4 py-4 shadow-sm">
                            <div
                                ref={historyRef}
                                className="text-right text-gray-500 text-sm min-h-[24px] overflow-x-auto whitespace-nowrap"
                            >
                                {fullHistory}
                            </div>
                            <div className="text-right text-4xl font-bold text-gray-900 min-h-[40px]">{display}</div>
                        </div>

                        {/* Buttons Grid */}
                        <div className="grid grid-cols-4 gap-3">
                            {btn("(", () => {}, "#4b5563", "#374151")}
                            {btn(")", () => {}, "#4b5563", "#374151")}
                            {btn("√", handleSquareRoot, "#4b5563", "#374151")}
                            {btn("x²", handleSquare, "#4b5563", "#374151")}

                            {btn("C", handleClear, "#ef4444", "#dc2626")}
                            {btn("⌫", handleBackspace, "#f97316", "#ea580c")}
                            {btn("Ans", handleEquals, "#1e293b", "#0f172a")}
                            {btn("÷", () => handleOperator('÷'), "#3b82f6", "#2563eb")}

                            {btn("7", () => handleNumber(7), "#1e293b", "#111827")}
                            {btn("8", () => handleNumber(8), "#1e293b", "#111827")}
                            {btn("9", () => handleNumber(9), "#1e293b", "#111827")}
                            {btn("×", () => handleOperator('×'), "#3b82f6", "#2563eb")}

                            {btn("4", () => handleNumber(4), "#1e293b", "#111827")}
                            {btn("5", () => handleNumber(5), "#1e293b", "#111827")}
                            {btn("6", () => handleNumber(6), "#1e293b", "#111827")}
                            {btn("-", () => handleOperator('-'), "#3b82f6", "#2563eb")}

                            {btn("1", () => handleNumber(1), "#1e293b", "#111827")}
                            {btn("2", () => handleNumber(2), "#1e293b", "#111827")}
                            {btn("3", () => handleNumber(3), "#1e293b", "#111827")}
                            {btn("+", () => handleOperator('+'), "#3b82f6", "#2563eb")}

                            {btn("%", () => handleOperator('%'), "#3b82f6", "#2563eb")}
                            {btn("0", () => handleNumber(0), "#1e293b", "#111827")}
                            {btn(".", handleDecimal, "#4b5563", "#374151")}
                            {btn("=", handleEquals, "#22c55e", "#16a34a")}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
