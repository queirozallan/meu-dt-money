// ModalConfirm.tsx
import React from 'react';

type ModalConfirmProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
};

export function ModalConfirm({ isOpen, onConfirm, onCancel, message = "Tem certeza que deseja excluir?" }: ModalConfirmProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Excluir</button>
        </div>
      </div>
    </div>
  );
}
