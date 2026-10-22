from database import SessionLocal
from models import Operator
from auth import get_password_hash
db = SessionLocal()
db.add(Operator(
    username='admin',
    email='admin@local.com',
    hashed_password=get_password_hash('admin123'),
    is_admin=True, is_active=True, is_banned=False
))
db.commit()
print('OK: admin / admin123')
