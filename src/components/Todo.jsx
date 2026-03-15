import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, CheckCircle2, X, Circle, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

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
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const clearAll = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all todos?",
    );
    if (confirmClear) {
      setTodos([]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl"
    >
      <Card className="overflow-hidden border-border/70 bg-card/95 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
              Taskflow
            </CardTitle>
            {todos.length > 0 && (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearAll}
                  className="h-9 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-4 pt-0 sm:p-6 sm:pt-0">
          <form onSubmit={addTodo}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="What needs to be done?"
                className="h-10 sm:h-11"
              />
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  className="h-10 w-full gap-2 sm:h-11 sm:w-auto"
                  type="submit"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Task
                </Button>
              </motion.div>
            </div>
          </form>

          <motion.ul layout className="space-y-2.5 sm:space-y-3">
            <AnimatePresence>
              {todos.map((todo) => (
                <motion.li
                  key={todo.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  layout
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 p-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => toggleTodo(todo.id)}
                      className="flex-shrink-0"
                      type="button"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </motion.button>

                    <span
                      className={cn(
                        "truncate text-sm sm:text-base",
                        todo.completed
                          ? "text-muted-foreground line-through"
                          : "text-foreground",
                      )}
                    >
                      {todo.text}
                    </span>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>

          {todos.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-dashed border-border/70 bg-muted/20 py-8 text-center"
            >
              <p className="text-sm text-muted-foreground sm:text-base">
                No tasks yet. Add one to get started.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default Todo;
