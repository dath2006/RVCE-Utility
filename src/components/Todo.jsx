import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  CheckCircle2,
  XCircle,
  Circle,
  Trash2,
} from "lucide-react";

function Todo() {
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
    setNewTodo("");
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const clearAll = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all todos?"
    );
    if (confirmClear) {
      setTodos([]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 max-h-[70vh] overflow-y-auto"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 font-playfair text-center sm:text-left">
          Taskflow
        </h1>
        {todos.length > 0 && (
          <motion.button
            whilehover={{ scale: 1.05 }}
            whiletap={{ scale: 0.95 }}
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm sm:text-base"
          >
            <Trash2 size={18} className="sm:w-5 sm:h-5" />
            Clear All
          </motion.button>
        )}
      </div>

      <form onSubmit={addTodo} className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400 font-inter text-gray-700 text-sm sm:text-base"
          />
          <motion.button
            whilehover={{ scale: 1.05 }}
            whiletap={{ scale: 0.95 }}
            className="bg-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-indigo-700 transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            <PlusCircle size={18} className="sm:w-5 sm:h-5" />
            Add Task
          </motion.button>
        </div>
      </form>

      <motion.ul layout className="space-y-3 sm:space-y-4">
        <AnimatePresence>
          {todos.map((todo) => (
            <motion.li
              key={todo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              layout
              className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3 sm:gap-4"
            >
              <motion.div
                className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0"
                whilehover={{ x: 10 }}
              >
                <motion.button
                  whilehover={{ scale: 1.2 }}
                  whiletap={{ scale: 0.9 }}
                  onClick={() => toggleTodo(todo.id)}
                  className="flex-shrink-0"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="text-green-500 w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <Circle className="text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </motion.button>
                <span
                  className={`text-base sm:text-lg truncate ${
                    todo.completed
                      ? "line-through text-gray-400"
                      : "text-gray-700"
                  }`}
                >
                  {todo.text}
                </span>
              </motion.div>
              <motion.button
                whilehover={{ scale: 1.2, rotate: 90 }}
                whiletap={{ scale: 0.9 }}
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-600 flex-shrink-0"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {todos.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 mt-6 sm:mt-8"
        >
          <p className="text-base sm:text-lg">
            No tasks yet. Add one to get started!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Todo;
