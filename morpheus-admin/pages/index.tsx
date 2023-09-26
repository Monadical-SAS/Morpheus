import { useEffect, useState } from "react";
import MainLayout from "@/layout/MainContainer/MainLayout";
import Modal from "@/components/atoms/modal";
import PrivateRoute from "@/layout/PrivateRoute/PrivateRoute";
import { ModelForm } from "@/components/organisms/ModelForm/ModelForm";
import { Button, ButtonSize, ButtonVariant } from "@/components/atoms/button";
import { deleteModel, getAvailableModels, updateModel } from "@/api/models";
import { useToastContext } from "@/context/ToastContext";
import { Model, Response } from "@/lib/models";
import styles from "@/styles/pages/Home.module.scss";

export default function Home() {
  const [models, setModels] = useState<Model[]>([]);
  const [open, setOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [removingModel, setRemovingModel] = useState<Model | null>(null);
  const { showErrorAlert, showSuccessAlert } = useToastContext();

  useEffect(() => {
    getAvailableModels()
      .then((response: Response) => {
        setModels(response.data);
      })
      .catch((error) => {
        showErrorAlert("Something went wrong. Please try again later.");
      });
  }, []);

  const handleActivateModel = (model: Model) => {
    const modelData = { ...model, is_active: !model.is_active };
    updateModel(modelData)
      .then((response: Response) => {
        if (response.success) {
          showErrorAlert(response.message);
          const updatedModels = models.map((modelData) => {
            if (modelData.source === response.data.model_updated.source) {
              return response.data.model_updated;
            }
            return modelData;
          });
          setModels(updatedModels);
          showSuccessAlert("Model updated successfully.");
        } else {
          showErrorAlert("Something went wrong. Please try again later.");
        }
      })
      .catch((error) => {
        showErrorAlert(error);
      });
  };

  const handleRemoveModel = (model: Model) => {
    deleteModel(model.source)
      .then((response: Response) => {
        if (response.success) {
          const updatedModels = models.filter(
            (modelData) =>
              modelData.source !== response.data.model_deleted.source,
          );
          setModels(updatedModels);
          setRemovingModel(null);
          showSuccessAlert("Model removed successfully.");
        } else {
          showErrorAlert("Something went wrong. Please try again later.");
        }
      })
      .catch((error) => {
        showErrorAlert(error);
      });
  };

  return (
    <PrivateRoute>
      <MainLayout>
        <main className={styles.main}>
          <h1 className="text-5xl font-bold">Models</h1>

          <div className="my-5">
            <Button
              text={"Add Model"}
              variant={ButtonVariant.Primary}
              size={ButtonSize.Md}
              onClick={() => setOpen(true)}
            />
            <Modal open={open} onClose={() => setOpen(false)}>
              <ModelForm
                title={"Add a new Model"}
                models={models}
                setModels={setModels}
                handleModalClose={() => setOpen(false)}
              />
            </Modal>
          </div>

          {models.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Model Name</th>
                    <th>Source</th>
                    <th>Is Active</th>
                    <th>Edit</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model, index) => (
                    <tr key={model.id}>
                      <th>{model.name}</th>
                      <td>{model.source}</td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle"
                          checked={model.is_active}
                          onChange={() => handleActivateModel(model)}
                        />
                      </td>
                      <td>
                        <span
                          onClick={() => setEditingModel(model)}
                          className="cursor-pointer"
                        >
                          Edit
                        </span>
                      </td>
                      <td>
                        <span
                          onClick={() => setRemovingModel(model)}
                          className="cursor-pointer"
                        >
                          Remove
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {editingModel && (
                <Modal
                  open={editingModel !== null}
                  onClose={() => setEditingModel(null)}
                >
                  <ModelForm
                    title={"Edit Model"}
                    editingModel={editingModel}
                    models={models}
                    setModels={setModels}
                    formUpdate={true}
                    handleModalClose={() => setEditingModel(null)}
                  />
                </Modal>
              )}
              {removingModel && (
                <Modal
                  open={removingModel !== null}
                  onClose={() => setRemovingModel(null)}
                >
                  <div className="modal-body">
                    <p>Are you sure you want to remove this model?</p>
                    <div className="flex flex-row justify-center gap-8 pt-4">
                      <Button
                        text={"Cancel"}
                        variant={ButtonVariant.Primary}
                        onClick={() => setRemovingModel(null)}
                      />
                      <Button
                        text={"Remove"}
                        variant={ButtonVariant.Warning}
                        onClick={() => handleRemoveModel(removingModel)}
                      />
                    </div>
                  </div>
                </Modal>
              )}
            </div>
          )}
        </main>
      </MainLayout>
    </PrivateRoute>
  );
}
