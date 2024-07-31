import { Lesson } from "@prisma/client";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { Edit, FileText } from "lucide-react";

interface LessonListProps {
  lessonItems: Lesson[];
  onReOrder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
}

const LessonList = ({ lessonItems, onReOrder, onEdit }: LessonListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [lessons, setLessons] = useState(lessonItems);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setLessons(lessonItems);
  }, [lessonItems]);

  const onDragEnd = (result: DropResult) => {
    // Kiểm tra xem hành động kéo-thả có điểm đến hợp lệ hay không. Nếu không, hàm sẽ thoát sớm.
    if (!result.destination) {
      return;
    }
    const lessonItems = Array.from(lessons); // Tạo một bản sao nông của mảng lessons để tránh thay đổi trực tiếp trạng thái.
    const [reorderedItem] = lessonItems.splice(result.source.index, 1);
    lessonItems.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.min(result.source.index, result.destination.index);
    const updatedLessons = lessonItems.slice(startIndex, endIndex + 1);
    setLessons(lessonItems);

    const bulkUpdateData = updatedLessons.map((lesson, index) => ({
      id: lesson.id,
      position: lessonItems.findIndex((item) => item.id === lesson.id),
    }));
    onReOrder(bulkUpdateData);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lessons">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex flex-col gap-5 ${
              lessons.length > 0 ? "my-5" : "mt-5"
            }`}
          >
            {lessons.map((lesson, index) => (
              <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                {(provided) => (
                  <div
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    className="flex items-center rounded-lg text-sm font-medium bg-primary/50 text-white p-3"
                  >
                    <div {...provided.dragHandleProps}>
                      <FileText className="h-4 w-4 cursor-pointer mr-4 hover:text-primary" />
                    </div>
                    {lesson.titleLesson}
                    <div className="ml-auto">
                      <Edit
                        onClick={() => onEdit(lesson.id)}
                        className="h-4 w-4 cursor-pointer hover:text-primary"
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default LessonList;
