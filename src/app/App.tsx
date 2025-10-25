import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Generate } from "../pages";
import { QueryHistory } from "../pages";
import { DatabaseDiagram } from "../pages";

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Generate />} />
        <Route path="/history" element={<QueryHistory />} />
        <Route
          path="/editor"
          element={<DatabaseDiagram tables={tables} relations={relations} />}
        />
      </Routes>
    </Router>
  );
};

const tables = [
  {
    id: "users",
    name: "Users",
    x: 50,
    y: 50,
    fields: [
      { name: "id", type: "INT", isPrimaryKey: true },
      { name: "username", type: "VARCHAR" },
      { name: "email", type: "VARCHAR" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "posts",
    name: "Posts",
    x: 400,
    y: 50,
    fields: [
      { name: "id", type: "INT", isPrimaryKey: true },
      { name: "user_id", type: "INT", isForeignKey: true },
      { name: "title", type: "VARCHAR" },
      { name: "content", type: "TEXT" },
    ],
  },
  {
    id: "comments",
    name: "Comments",
    x: 750,
    y: 50,
    fields: [
      { name: "id", type: "INT", isPrimaryKey: true },
      { name: "post_id", type: "INT", isForeignKey: true },
      { name: "user_id", type: "INT", isForeignKey: true },
      { name: "text", type: "TEXT" },
    ],
  },
  {
    id: "tags",
    name: "Tags",
    x: 400,
    y: 250,
    fields: [
      { name: "id", type: "INT", isPrimaryKey: true },
      { name: "name", type: "VARCHAR" },
      { name: "name", type: "VARCHAR" },
      { name: "name", type: "VARCHAR" },
    ],
  },
  {
    id: "post_tags",
    name: "Post_Tags",
    x: 400,
    y: 400,
    fields: [
      { name: "post_id", type: "INT", isForeignKey: true },
      { name: "tag_id", type: "INT", isForeignKey: true },
    ],
  },
];

const relations = [
  {
    fromTable: "users",
    toTable: "posts",
    fromField: "id",
    toField: "user_id",
    type: "one-to-many" as const,
  },
  {
    fromTable: "posts",
    toTable: "comments",
    fromField: "id",
    toField: "post_id",
    type: "one-to-many" as const,
  },
  {
    fromTable: "users",
    toTable: "comments",
    fromField: "id",
    toField: "user_id",
    type: "one-to-many" as const,
  },
  {
    fromTable: "posts",
    toTable: "post_tags",
    fromField: "id",
    toField: "post_id",
    type: "one-to-many" as const,
  },
  {
    fromTable: "tags",
    toTable: "post_tags",
    fromField: "id",
    toField: "tag_id",
    type: "one-to-many" as const,
  },
];
