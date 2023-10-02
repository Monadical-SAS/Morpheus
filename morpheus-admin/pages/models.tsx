import React, { useEffect, useState } from "react";
import MainLayout from "@/layout/MainContainer/MainLayout";
import Modal from "@/components/atoms/modal";
import PrivateRoute from "@/layout/PrivateRoute/PrivateRoute";
import { ModelForm } from "@/components/organisms/ModelForm/ModelForm";
import { Button, ButtonSize, ButtonVariant } from "@/components/atoms/button";
import { Select } from "@/components/atoms/select";
import { deleteModel, getAvailableModels, updateModel } from "@/api/models";
import { Model, Response } from "@/lib/models";
import styles from "@/styles/pages/Home.module.scss";
import { useToastContext } from "@/context/ToastContext";
import { TextInput } from "@/components/atoms/input";

export default function Home() {
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [open, setOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [removingModel, setRemovingModel] = useState<Model | null>(null);
  const [filters, setFilters] = useState({
    is_active: "all",
    kind: "all",
    name: "",
    source: "",
  });

  const { showErrorAlert, showSuccessAlert } = useToastContext();

  useEffect(() => {
    getAvailableModels()
      .then((response: Response) => {
        const all_models: Model[] = response.data;
        all_models.sort((a, b) =>
          a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1
        );
        setModels(all_models);
        setFilteredModels(all_models);
      })
      .catch((error) => {
        showErrorAlert("Something went wrong. Please try again later.");
      });
  }, []);

  useEffect(() => {
    // Update filteredModels when models change or filters change
    const modelsFiltered = models.filter((model) => {
      const statusFilter =
        filters.is_active === "all" ||
        model.is_active === (filters.is_active === "active");

      const kindFilter = filters.kind === "all" || model.kind === filters.kind;

      const nameFilter = model.name
        .toLowerCase()
        .includes(filters.name.toLowerCase());

      const sourceFilter = model.source
        .toLowerCase()
        .includes(filters.source.toLowerCase());

      return statusFilter && kindFilter && nameFilter && sourceFilter;
    });

    modelsFiltered.sort((a, b) =>
      a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1
    );

    setFilteredModels(modelsFiltered);
  }, [models, filters]);

  const filterStatusOptions: Array<string> = ["all", "active", "inactive"];
  const filterKindOptions: Array<string> = [
    "all",
    ...new Set(models.map((model: Model) => model.kind)),
  ];

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
          const updatedModels = models.filter((modelData) => modelData.source !== response.data.model_deleted.source);
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

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
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
            <div className="flex w-3/4 my-5 space-x-4 ">
              <Select
                name="is_active"
                label="filter by status"
                options={filterStatusOptions}
                onChange={handleFilterChange}
              />
              <Select
                name="kind"
                label="filter by kind"
                options={filterKindOptions}
                onChange={handleFilterChange}
              />
              <TextInput
                name="name"
                label="filter by model name"
                placeholder="Enter model name"
                onChange={handleFilterChange}
              />
              <TextInput
                name="source"
                label="filter by source"
                placeholder="Enter source"
                onChange={handleFilterChange}
              />
            </div>
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Model Name</th>
                  <th>Kind</th>
                  <th>Source</th>
                  <th>Is Active</th>
                  <th>Edit</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((model, index) => (
                  <tr key={model.id}>
                    <th>{model.name}</th>
                    <td>{model.kind}</td>
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
