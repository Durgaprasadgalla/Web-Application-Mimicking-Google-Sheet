import React, { useState } from "react";
import { evaluate } from "mathjs";
import "./App.css";

function App() {
  const rows = 10;
  const cols = 5;
  const colHeaders = Array.from({ length: cols }, (_, i) => String.fromCharCode(65 + i)); // A, B, C, etc.

  const [cells, setCells] = useState(
    Array(rows)
      .fill("")
      .map(() => Array(cols).fill(""))
  );

  const handleChange = (row, col, value) => {
    setCells((prevCells) => {
      const newCells = [...prevCells];
      newCells[row] = [...newCells[row]];
      newCells[row][col] = value;
      return newCells;
    });
  };

  const handleBlur = (row, col) => {
    setCells((prevCells) => {
      let value = prevCells[row][col] ?? "";

      if (typeof value !== "string") value = String(value);

      if (value.startsWith("=")) {
        let formula = value.substring(1).trim();

        try {
          if (/^[0-9+\-*/().\s]+$/.test(formula)) {
            const result = evaluate(formula);
            return updateCell(prevCells, row, col, result);
          } else if (formula.match(/(SUM|AVERAGE|MAX|MIN)\([A-Z]\d+:[A-Z]\d+\)/)) {
            const range = formula.match(/\(([^)]+)\)/)[1];
            const values = getRangeValues(prevCells, range);

            let result;
            if (formula.startsWith("SUM")) result = values.reduce((a, b) => a + b, 0);
            if (formula.startsWith("AVERAGE")) result = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            if (formula.startsWith("MAX")) result = values.length > 0 ? Math.max(...values) : 0;
            if (formula.startsWith("MIN")) result = values.length > 0 ? Math.min(...values) : 0;

            return updateCell(prevCells, row, col, result);
          } else {
            throw new Error("Invalid Formula");
          }
        } catch (error) {
          return updateCell(prevCells, row, col, "Invalid Formula");
        }
      }
      return prevCells;
    });
  };

  const getCellIndex = (cellRef) => {
    const col = cellRef.charCodeAt(0) - 65;
    const row = parseInt(cellRef.substring(1), 10) - 1;
    return { row, col };
  };

  const getRangeValues = (currentCells, range) => {
    const [start, end] = range.split(":");
    const startIdx = getCellIndex(start);
    const endIdx = getCellIndex(end);

    let values = [];
    for (let i = startIdx.row; i <= endIdx.row; i++) {
      const cellValue = currentCells[i][startIdx.col];
      if (!isNaN(cellValue) && cellValue !== "") {
        values.push(parseFloat(cellValue));
      }
    }
    return values;
  };

  const updateCell = (currentCells, row, col, value) => {
    const newCells = [...currentCells];
    newCells[row] = [...newCells[row]];
    newCells[row][col] = value;
    return newCells;
  };

  return (
    <div className="spreadsheet-container">
      {/* Formula Helper Section */}
      <div className="formula-helper">
        <h3>Available Formulas</h3>
        <p>Type formulas using <code>=</code>. Example: <b>=2+2</b></p>
        <ul>
          <li><b>=SUM(A1:A3)</b> → Adds values</li>
          <li><b>=AVERAGE(A1:A3)</b> → Finds average</li>
          <li><b>=MAX(A1:A3)</b> → Finds the largest value</li>
          <li><b>=MIN(A1:A3)</b> → Finds the smallest value</li>
        </ul>
      </div>

      {/* Spreadsheet Table */}
      <table>
        <thead>
          <tr>
            <th></th> {/* Empty top-left corner */}
            {colHeaders.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cells.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td><b>{rowIndex + 1}</b></td> {/* Row number */}
              {row.map((cell, colIndex) => (
                <td key={colIndex}>
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                    onBlur={() => handleBlur(rowIndex, colIndex)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
