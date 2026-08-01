"use client";
import React, { useState } from 'react';

const TeacherPreparationTimeCalculator: React.FC = () => {
  const [numClasses, setNumClasses] = useState(5);
  const [prepPerClass, setPrepPerClass] = useState(30); // minutes
  const [numStudents, setNumStudents] = useState(25);
  const [gradingPerStudent, setGradingPerStudent] = useState(5); // minutes
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculatePrepTime = () => {
    setError(null);
    const numClassesNum = parseInt(numClasses.toString(), 10);
    const prepPerClassNum = parseInt(prepPerClass.toString(), 10);
    const numStudentsNum = parseInt(numStudents.toString(), 10);
    const gradingPerStudentNum = parseInt(gradingPerStudent.toString(), 10);

    if (
      isNaN(numClassesNum) ||
      isNaN(prepPerClassNum) ||
      isNaN(numStudentsNum) ||
      isNaN(gradingPerStudentNum)
    ) {
      setError('Please enter valid numbers for all fields');
      return;
    }

    if (
      numClassesNum < 0 ||
      prepPerClassNum < 0 ||
      numStudentsNum < 0 ||
      gradingPerStudentNum < 0
    ) {
      setError('Please enter non-negative numbers');
      return;
    }

    const prepTime = numClassesNum * prepPerClassNum + numStudentsNum * gradingPerStudentNum;
    setResult(prepTime);
  };

  return (
    <div>
      <h1>Teacher Preparation Time Calculator</h1>
      <div>
        <label>
          Number of Classes:
          <input
            type="number"
            value={numClasses}
            onChange={(e) => setNumClasses(parseInt(e.target.value) || 5)}
            min="0"
          />
        </label>
      </div>
      <div>
        <label>
          Prep Time per Class (minutes):
          <input
            type="number"
            value={prepPerClass}
            onChange={(e) => setPrepPerClass(parseInt(e.target.value) || 30)}
            min="0"
          />
        </label>
      </div>
      <div>
        <label>
          Number of Students:
          <input
            type="number"
            value={numStudents}
            onChange={(e) => setNumStudents(parseInt(e.target.value) || 25)}
            min="0"
          />
        </label>
      </div>
      <div>
        <label>
          Grading Time per Student (minutes):
          <input
            type="number"
            value={gradingPerStudent}
            onChange={(e) => setGradingPerStudent(parseInt(e.target.value) || 5)}
            min="0"
          />
        </label>
      </div>
      <button onClick={calculatePrepTime}>Calculate</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result !== null && (
        <p>
          Total preparation time: <strong>{result}</strong> minutes ({Math.floor(
            result / 60
          )} hours {result % 60} minutes)
        </p>
      )}
    </div>
  );
};

export default TeacherPreparationTimeCalculator;