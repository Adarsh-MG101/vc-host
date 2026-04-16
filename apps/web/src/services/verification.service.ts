const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export interface IVerificationResult {
  verified: boolean;
  message?: string;
  certificate?: {
    uniqueId: string;
    recipient: string;
    issuedAt: string;
    organization: {
      name: string;
      logo?: string;
      slug: string;
    };
    templateName: string;
    details: Record<string, any>;
  };
}

export const verificationService = {
  verify: async (id: string): Promise<IVerificationResult> => {
    try {
      const response = await fetch(`${API_URL}/verify/${id}`);
      return await response.json();
    } catch (err) {
      return { 
        verified: false, 
        message: 'Unable to connect to verification server' 
      };
    }
  }
};
