import React from 'react';
import Button from '../../../../components/common/Button/Button';

export default function MaterialClassifiersTable({ classifiers, onEdit, onDelete }) {
    if (!classifiers || classifiers.length === 0) {
        return (
            <div className="empty-message">
                Класифікатори матеріалів відсутні. Натисніть кнопку "Додати класифікатор", щоб створити новий запис.
            </div>
        );
    }

    // Функція для отримання ієрархічного відступу
    const getIndentation = (classifier) => {
        if (!classifier.parentId) return '';
        return <span className="hierarchy-indent">↳</span>;
    };

    // Сортуємо класифікатори для відображення ієрархії
    const sortedClassifiers = [...classifiers].sort((a, b) => {
        // Спочатку сортуємо за батьківським ID (null батьки йдуть першими)
        if (!a.parentId && b.parentId) return -1;
        if (a.parentId && !b.parentId) return 1;

        // Потім за назвою
        return a.name.localeCompare(b.name);
    });

    return (
        <table className="admin-table">
            <thead>
            <tr>
                <th>ID</th>
                <th>Назва</th>
                <th>Опис</th>
                <th>Батьківський класифікатор</th>
                <th>Дії</th>
            </tr>
            </thead>
            <tbody>
            {sortedClassifiers.map((classifier) => (
                <tr key={classifier.id}>
                    <td>{classifier.id}</td>
                    <td>
                        {getIndentation(classifier)}
                        {classifier.name}
                    </td>
                    <td>{classifier.description || "—"}</td>
                    <td>{classifier.parent ? classifier.parent.name : "—"}</td>
                    <td className="actions-cell">
                        <Button
                            variant="outline"
                            size="small"
                            icon="✏️"
                            className="action-button"
                            onClick={() => onEdit(classifier)}
                        >
                            Редагувати
                        </Button>
                        <Button
                            variant="danger"
                            size="small"
                            icon="🗑️"
                            className="action-button"
                            onClick={() => onDelete(classifier)}
                        >
                            Видалити
                        </Button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}