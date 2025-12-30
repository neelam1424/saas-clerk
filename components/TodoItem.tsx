"use client";

import React from "react";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate, onDelete }) => {
  return (
    <li className="flex justify-between items-center border p-2 rounded">
      <span
        className={`flex-1 ${todo.completed ? "line-through text-gray-500" : ""}`}
      >
        {todo.title}
      </span>
      <button
        className="mr-2 text-green-500"
        onClick={() => onUpdate(todo.id, !todo.completed)}
      >
        {todo.completed ? "Undo" : "Done"}
      </button>
      <button className="text-red-500" onClick={() => onDelete(todo.id)}>
        Delete
      </button>
    </li>
  );
};
