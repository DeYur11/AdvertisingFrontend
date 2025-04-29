import { gql, useQuery } from "@apollo/client";
import { Box, CircularProgress } from "@mui/material";

const REVIEWS_BY_MATERIAL = gql`
  query GetReviewsByMaterial($materialId: ID!) {
    reviewsByMaterial(materialId: $materialId) {
      id
      comments
      suggestedChange
      reviewDate
      createDatetime
      reviewer {
        id
        name
        surname
      }
    }
  }
`;

export default function MaterialDetails({ material, onBack }) {
    const { data, loading, error } = useQuery(REVIEWS_BY_MATERIAL, {
        variables: { materialId: material.id },
        fetchPolicy: "network-only",
        onError: (error) => {
            console.error("Помилка завантаження відгуків:", error.message);
        },
    });

    const reviews = data?.reviewsByMaterial || [];

    return (
        <div className="material-details-tab">
            <button onClick={onBack} className="btn btn-sm btn-outline-secondary mb-3">
                ⬅️ Назад до матеріалів
            </button>

            <h5>Інформація про матеріал</h5>
            <p><strong>Назва:</strong> {material.name}</p>
            <p><strong>Опис:</strong> {material.description || "Немає опису"}</p>
            <p><strong>Статус:</strong> {material.status?.name || "—"}</p>
            <p><strong>Мова:</strong> {material.language?.name || "—"}</p>

            {material.keywords?.length > 0 ? (
                <>
                    <h6 className="mt-3">Ключові слова</h6>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                        {material.keywords.map((kw) => (
                            <span
                                key={kw.id}
                                className="badge bg-light border text-dark px-2 py-1"
                            >
                #{kw.name}
              </span>
                        ))}
                    </div>
                </>
            ) : (
                <p className="text-muted">Ключові слова не вказано.</p>
            )}

            <hr />

            <h5>Відгуки про матеріал</h5>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            )}

            {error && (
                <p className="text-danger mt-2">Помилка при завантаженні відгуків.</p>
            )}

            {!loading && !error && (
                <div
                    style={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        marginTop: "10px",
                        paddingRight: "5px",
                    }}
                >
                    {reviews.length === 0 ? (
                        <p>Відгуків поки немає.</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="border rounded p-2 mb-3">
                                <div>
                                    <strong>Рецензент:</strong>{" "}
                                    {review.reviewer
                                        ? `${review.reviewer.name} ${review.reviewer.surname}`
                                        : "Невідомо"}
                                </div>
                                <div>
                                    <strong>Дата рецензії:</strong>{" "}
                                    {review.reviewDate || review.createDatetime}
                                </div>
                                <div>
                                    <strong>Коментар:</strong> {review.comments || "—"}
                                </div>
                                <div>
                                    <strong>Запропоновані зміни:</strong>{" "}
                                    {review.suggestedChange || "—"}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
