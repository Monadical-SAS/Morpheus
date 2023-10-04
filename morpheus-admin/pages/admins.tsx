import { useEffect, useState, useContext } from "react";
import MainLayout from "@/layout/MainContainer/MainLayout";
import Modal from "@/components/atoms/modal";
import PrivateRoute from "@/layout/PrivateRoute/PrivateRoute";
import { AdminForm } from "@/components/organisms/AdminForm/AdminForm";
import { Button, ButtonSize, ButtonVariant } from "@/components/atoms/button";
import { useToastContext } from "@/context/ToastContext";
import styles from "@/styles/pages/Home.module.scss";
import { Response, User } from "@/lib/models";
import { deleteAdmin, getAdmins } from "@/api/users";
import { LoadingContext } from "@/context/LoadingContext";

export default function Home() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [removingAdmin, setRemovingAdmin] = useState<User | null>(null);
  const { showErrorAlert, showSuccessAlert } = useToastContext();
  const { loading, setLoading } = useContext(LoadingContext);

  useEffect(() => {
    getAdminUsers();
  }, []);

  const getAdminUsers = () => {
    getAdmins()
      .then((response: Response) => {
        setAdmins(response.data);
      })
      .catch(() => {
        showErrorAlert("Something went wrong. Please try again later.");
      });
  };

  const handleRefresh = () => {
    getAdminUsers();
    setOpen(false);
  };

  const handleRemoveAdmin = (admin: User) => {
    if (!loading) {
      setLoading(true);
      deleteAdmin(admin.email)
        .then((response: Response) => {
          if (response.success) {
            showSuccessAlert("Admin removed successfully.");
            handleRefresh();
            setRemovingAdmin(null);
          } else {
            showErrorAlert("Something went wrong. Please try again later.");
          }
          setLoading(false);
        })
        .catch((error: Error) => {
          showErrorAlert(error.message);
          setLoading(false);
        });
    }
  };

  return (
    <PrivateRoute>
      <MainLayout>
        <main className={styles.main}>
          <h1 className="text-5xl font-bold">Admins</h1>

          <div className="my-5">
            <Button
              text={"Add Admin"}
              variant={ButtonVariant.Primary}
              size={ButtonSize.Md}
              onClick={() => setOpen(true)}
            />
            <Modal open={open} onClose={() => setOpen(false)}>
              <AdminForm handleRefresh={handleRefresh} />
            </Modal>
          </div>

          {admins && admins.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Admin Name</th>
                    <th>Email</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin: User) => (
                    <tr key={admin.email}>
                      <th>{admin.email}</th>
                      <td>{admin.name}</td>
                      <td>
                        <span onClick={() => setRemovingAdmin(admin)} className="cursor-pointer">
                          Remove
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {removingAdmin && (
                <Modal open={!!removingAdmin} onClose={() => setRemovingAdmin(null)}>
                  <div className="modal-body">
                    <p>Are you sure you want to remove this admin?</p>
                    <div className="flex flex-row justify-center gap-8 pt-4">
                      <Button text={"Cancel"} variant={ButtonVariant.Primary} onClick={() => setRemovingAdmin(null)} />
                      <Button
                        text={"Remove"}
                        variant={ButtonVariant.Warning}
                        onClick={() => handleRemoveAdmin(removingAdmin)}
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
