import { createContext, useContext, useState } from 'react';

const ClassContext = createContext();

export function ClassProvider({ children }) {
  const [selectedClass, setSelectedClass] = useState(localStorage.getItem('selectedClass') || '');

  const selectClass = (cls) => {
    localStorage.setItem('selectedClass', cls);
    setSelectedClass(cls);
  };

  const clearClass = () => {
    localStorage.removeItem('selectedClass');
    setSelectedClass('');
  };

  return (
    <ClassContext.Provider value={{ selectedClass, selectClass, clearClass }}>
      {children}
    </ClassContext.Provider>
  );
}

export const useClass = () => useContext(ClassContext);
