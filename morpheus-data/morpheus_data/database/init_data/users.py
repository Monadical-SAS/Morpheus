from morpheus_data.config import get_settings
from morpheus_data.database.init_data.roles import user_role, admin_role

settings = get_settings()

morpheus_user = {
    "email": "user@morpheus.com",
    "name": "Morpheus User",
    "roles": [user_role]
}

morpheus_admin = {
    "email": settings.admin_email,
    "password": settings.admin_password,
    "name": "Morpheus Admin",
    "roles": [admin_role]
}
