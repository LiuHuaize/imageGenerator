import { db, storage } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Design } from '@/types/design';

const DESIGNS_COLLECTION = 'designs';

async function uploadImageToStorage(imageUrl: string, userId: string): Promise<string> {
  try {
    console.log('开始从URL获取图片:', imageUrl);
    
    // 从远程URL获取图片
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`获取图片失败: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('图片获取成功，大小:', blob.size, '字节');
    
    // 检查文件大小
    if (blob.size > 5 * 1024 * 1024) {
      throw new Error('图片大小超过5MB限制');
    }
    
    // 检查文件类型
    if (!blob.type.startsWith('image/')) {
      throw new Error('文件类型必须是图片');
    }
    
    // 生成唯一的文件名
    const fileName = `designs/${userId}/${Date.now()}.png`;
    console.log('准备上传到路径:', fileName);
    
    const storageRef = ref(storage, fileName);
    
    // 上传到 Firebase Storage
    console.log('开始上传到 Storage...');
    await uploadBytes(storageRef, blob);
    console.log('上传完成，获取下载链接...');
    
    // 获取永久下载链接
    const permanentUrl = await getDownloadURL(storageRef);
    console.log('获取下载链接成功:', permanentUrl);
    
    return permanentUrl;
  } catch (error: any) {
    console.error('上传图片失败:', {
      error,
      errorCode: error.code,
      errorMessage: error.message,
      userId,
      imageUrl
    });
    
    if (error.code === 'storage/unauthorized') {
      throw new Error('没有权限上传图片，请确保已登录');
    }
    
    throw new Error('上传图片失败，请重试: ' + error.message);
  }
}

export async function saveDesign(userId: string, prompt: string, imageUrl: string): Promise<string> {
  try {
    console.log('开始保存作品:', { userId, prompt, imageUrl });
    
    // 先将图片上传到 Storage 获取永久链接
    console.log('上传图片到 Storage...');
    const permanentImageUrl = await uploadImageToStorage(imageUrl, userId);
    console.log('图片上传成功，永久链接:', permanentImageUrl);
    
    const design: Omit<Design, 'id'> = {
      userId,
      prompt,
      imageUrl: permanentImageUrl, // 使用永久链接
      createdAt: Date.now(),
    };

    const docRef = await addDoc(collection(db, DESIGNS_COLLECTION), design);
    console.log('作品保存成功，ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('保存作品失败:', error);
    throw new Error('保存作品失败，请重试');
  }
}

export async function getUserDesigns(userId: string): Promise<Design[]> {
  try {
    console.log('开始获取用户作品:', userId);
    
    const designsQuery = query(
      collection(db, DESIGNS_COLLECTION),
      where('userId', '==', userId)
    );

    console.log('查询条件:', {
      collection: DESIGNS_COLLECTION,
      userId
    });

    const snapshot = await getDocs(designsQuery);
    console.log('查询结果:', {
      empty: snapshot.empty,
      size: snapshot.size,
      docs: snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }))
    });

    const designs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Design));
    
    designs.sort((a, b) => b.createdAt - a.createdAt);

    console.log('处理后的设计作品:', designs);
    return designs;
  } catch (error) {
    console.error('获取作品列表失败:', error);
    throw new Error('获取作品列表失败，请重试');
  }
}

export async function deleteDesign(designId: string): Promise<void> {
  try {
    console.log('开始删除作品:', designId);
    
    // 先获取作品数据，以获取图片URL
    const designDocRef = doc(db, DESIGNS_COLLECTION, designId);
    const designSnapshot = await getDoc(designDocRef);
    
    if (designSnapshot.exists()) {
      const designData = designSnapshot.data();
      if (designData.imageUrl) {
        // 从图片URL中提取存储路径
        const imageUrl = new URL(designData.imageUrl);
        const storagePath = decodeURIComponent(imageUrl.pathname.split('/o/')[1].split('?')[0]);
        
        // 删除 Storage 中的图片
        try {
          const imageRef = ref(storage, storagePath);
          await deleteObject(imageRef);
          console.log('图片删除成功');
        } catch (error) {
          console.error('删除图片失败:', error);
          // 继续删除文档，即使图片删除失败
        }
      }
    }
    
    // 删除 Firestore 文档
    await deleteDoc(designDocRef);
    console.log('作品删除成功');
  } catch (error) {
    console.error('删除作品失败:', error);
    throw new Error('删除作品失败，请重试');
  }
} 