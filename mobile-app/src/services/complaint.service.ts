import { api } from './api';

export interface CreateComplaintParams {
  photoUri: string;
  latitude: number;
  longitude: number;
  compassHeading?: number;
  sizeEstimate?: string;
  focalLength?: number;
  sensorWidth?: number;
  sensorHeight?: number;
  zoomRatio?: number;
}

export class ComplaintService {
  static async submitComplaint(params: CreateComplaintParams) {
    const formData = new FormData();
    
    // Append photo
    const filename = params.photoUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    let type = 'image/jpeg'; // default fallback
    
    if (match) {
      const ext = match[1].toLowerCase();
      if (ext === 'jpg') {
        type = 'image/jpeg';
      } else {
        type = `image/${ext}`;
      }
    }
    
    formData.append('photo', {
      uri: params.photoUri,
      name: filename,
      type,
    } as any);

    // Append metadata
    formData.append('latitude', params.latitude.toString());
    formData.append('longitude', params.longitude.toString());
    
    if (params.compassHeading !== undefined) {
      formData.append('compassHeading', params.compassHeading.toString());
    }

    if (params.sizeEstimate) {
      formData.append('sizeEstimate', params.sizeEstimate);
    }
    
    if (params.focalLength !== undefined) formData.append('focalLength', params.focalLength.toString());
    if (params.sensorWidth !== undefined) formData.append('sensorWidth', params.sensorWidth.toString());
    if (params.sensorHeight !== undefined) formData.append('sensorHeight', params.sensorHeight.toString());
    if (params.zoomRatio !== undefined) formData.append('zoomRatio', params.zoomRatio.toString());

    const response = await api.post('/citizen/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  static async getNearbyComplaints() {
    const response = await api.get('/citizen/complaints/nearby');
    return response.data;
  }

  static async getMyComplaints() {
    const response = await api.get('/citizen/complaints');
    return response.data;
  }

  static async getComplaintById(id: string) {
    const response = await api.get(`/citizen/complaints/${id}`);
    return response.data;
  }

  // --- Crew Endpoints ---

  static async getDispatchedComplaints() {
    const response = await api.get('/crew/complaints');
    return response.data;
  }

  static async getCrewComplaintById(id: string) {
    const response = await api.get(`/crew/complaints/${id}`);
    return response.data;
  }

  static async resolveComplaint(id: string, photoUri: string, ppeConfirmed: boolean) {
    const formData = new FormData();
    
    const filename = photoUri.split('/').pop() || 'after_photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;
    
    formData.append('afterPhoto', {
      uri: photoUri,
      name: filename,
      type,
    } as any);

    formData.append('ppeConfirmed', ppeConfirmed.toString());

    const response = await api.patch(`/crew/complaints/${id}/resolve`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
}
