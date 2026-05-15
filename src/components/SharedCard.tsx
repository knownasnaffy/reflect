import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Key } from "react";

interface SharedCardProps {
  key?: Key;
  id: string;
  imageUrl: string;
  title: string;
  description: string;
}

export function SharedCard({ id, imageUrl, title, description }: SharedCardProps) {
  return (
    <Link to={`/view/${id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md cursor-pointer"
      >
        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
}
