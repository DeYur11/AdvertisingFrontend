import Button from "../../../../components/common/Button/Button";


export default function ReviewFormTab({
                                          material,
                                          formData,
                                          errors,
                                          setFormData,
                                          submitting,
                                          onClose,
                                          onSubmit,
                                          materialSummaries,
                                          isEditing,
                                          setIsEditing,
                                          setExistingReview, // додаємо для скидання відгуку при скасуванні
                                          disableSubmit = false,
                                          hasExistingReview = false
                                      }) {
    if (!formData) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setExistingReview(null);
        setFormData({
            comments: "",
            suggestedChange: "",
            reviewDate: "",
            materialSummaryId: null
        });
    };

    return (
        <div className="review-form-tab">
            <form onSubmit={onSubmit}>
                <div className="review-header">
                    <h3>{isEditing ? "Редагування рецензії" : "Нова рецензія"}</h3>
                </div>

                {hasExistingReview && !isEditing && (
                    <div className="submit-error">
                        Ви вже рецензували цей матеріал. Щоб змінити рецензію, використовуйте режим редагування.
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="comments">Коментарі*</label>
                    <textarea
                        id="comments"
                        name="comments"
                        rows="4"
                        value={formData?.comments || ""}
                        onChange={handleChange}
                        className={errors.comments ? "has-error" : ""}
                        disabled={hasExistingReview && !isEditing}
                    />
                    {errors.comments && (
                        <div className="error-message">{errors.comments}</div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="suggestedChange">Запропоновані зміни</label>
                    <textarea
                        id="suggestedChange"
                        name="suggestedChange"
                        rows="4"
                        value={formData?.suggestedChange || ""}
                        onChange={handleChange}
                        disabled={hasExistingReview && !isEditing}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="materialSummaryId">Кінцеве рішення</label>
                    <select
                        id="materialSummaryId"
                        name="materialSummaryId"
                        value={formData?.materialSummaryId || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                materialSummaryId: e.target.value
                                    ? parseInt(e.target.value)
                                    : null
                            }))
                        }
                        disabled={hasExistingReview && !isEditing}
                    >
                        <option value="">Оберіть...</option>
                        {materialSummaries.map((summary) => (
                            <option key={summary.id} value={summary.id}>
                                {summary.name}
                            </option>
                        ))}
                    </select>
                </div>

                {errors.submit && <div className="submit-error">{errors.submit}</div>}

                {material?.status?.name !== "Pending Review" && (
                    <div className="submit-error">
                        Рецензування недоступне. Матеріал повинен мати статус "Pending Review" для надання відгуку.
                    </div>
                )}

                <div className="action-buttons">
                    <Button variant="outline" onClick={onClose} type="button">
                        Скасувати
                    </Button>
                    {hasExistingReview && !isEditing && (
                        <Button variant="primary" onClick={() => setIsEditing(true)} type="button">
                            Редагувати мою рецензію
                        </Button>
                    )}
                    {isEditing && (
                        <Button variant="outline" onClick={handleCancelEdit} type="button">
                            Вийти з редагування
                        </Button>
                    )}
                    {(!hasExistingReview || isEditing) && (
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={submitting || disableSubmit}
                        >
                            {submitting ? "Збереження..." : isEditing ? "Зберегти зміни" : "Надіслати рецензію"}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}