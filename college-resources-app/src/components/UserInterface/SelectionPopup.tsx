Sure, here's the contents for the file `/college-resources-app/college-resources-app/src/components/UserInterface/SelectionPopup.tsx`:

import React, { useState } from 'react';

const SelectionPopup: React.FC<{ onClose: () => void; onSelect: (year: string, courses: string[]) => void; }> = ({ onClose, onSelect }) => {
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(event.target.value);
    };

    const handleCourseToggle = (course: string) => {
        setSelectedCourses(prevCourses => 
            prevCourses.includes(course) 
                ? prevCourses.filter(c => c !== course) 
                : [...prevCourses, course]
        );
    };

    const handleSubmit = () => {
        onSelect(selectedYear, selectedCourses);
        onClose();
    };

    return (
        <div className="selection-popup">
            <h2>Select Your Year and Courses</h2>
            <label>
                Year:
                <select value={selectedYear} onChange={handleYearChange}>
                    <option value="">Select Year</option>
                    <option value="1 Year">1 Year</option>
                    <option value="2 Year">2 Year</option>
                    <option value="3 Year">3 Year</option>
                    <option value="4 Year">4 Year</option>
                </select>
            </label>
            <div>
                <h3>Select Courses:</h3>
                <label>
                    <input type="checkbox" onChange={() => handleCourseToggle('Course 1')} />
                    Course 1
                </label>
                <label>
                    <input type="checkbox" onChange={() => handleCourseToggle('Course 2')} />
                    Course 2
                </label>
                <label>
                    <input type="checkbox" onChange={() => handleCourseToggle('Course 3')} />
                    Course 3
                </label>
            </div>
            <button onClick={handleSubmit}>Submit</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    );
};

export default SelectionPopup;