import { useEffect, useState } from "react";
import MainLayout from "@/layout/MainContainer/MainLayout";
import { ModelForm } from "@/components/models/ModelForm/ModelForm";
import styles from "@/styles/pages/Home.module.scss";
import { Button, ButtonSize, ButtonVariant } from "@/components/atoms/button";
import { getAvailableModels } from "@/api/models";
import { Model, Response } from "@/lib/models";
import Modal from "@/components/molecules/modal";

export default function Home() {
  const [models, setModels] = useState<Model[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getAvailableModels()
      .then((response: Response) => {
        setModels(response.data);
      })
      .catch((error) => {
        alert(error);
      });
  }, []);

  const handleActivateModel = (model: Model) => {
    console.log("handleActivateModel", model.source);
  };

  const handleEditModel = (model: Model) => {
    console.log("handleEditModel", model.source);
  };

  const handleRemoveModel = (model: Model) => {
    console.log("handleRemoveModel", model.source);
  };

  return (
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
            <ModelForm />
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
                {models.map((model) => (
                  <tr key={model.source}>
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
                      <span onClick={() => handleEditModel(model)}>Edit</span>
                    </td>
                    <td>
                      <span onClick={() => handleRemoveModel(model)}>
                        Remove
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </MainLayout>
  );
}
