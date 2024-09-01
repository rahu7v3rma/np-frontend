'use client'; // 👈 use it here
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import React from 'react';

export default function ConfirmationModal({
  isOpenModal,
  onClose,
  onConfirm,
  title,
  subTitle,
  messageText,
  cancelButtonText,
  confirmButtonText,
  confirmButtonStartContent,
}: any) {
  return (
    <>
      <Modal
        isOpen={isOpenModal}
        radius="none"
        onOpenChange={onClose}
        hideCloseButton={true}
        className="fixed h-full w-full"
      >
        <ModalContent
          className="items-center justify-center max-w-full ml-0"
          style={{ background: 'rgba(39, 40, 43, 0.9)' }}
        >
          <div className="bg-white rounded-2xl border-slate-50 mx-4 max-w-[420px]">
            <ModalHeader
              className="flex flex-col mt-6 font-bold text-lg py-0"
              style={{ color: '#363839' }}
            >
              {title}
            </ModalHeader>
            <ModalBody className="mt-6 font-normal py-0">
              <p style={{ color: '#363839' }}>{subTitle}</p>
              <p style={{ color: '#868788' }} className="mt-3">
                {messageText}
              </p>
            </ModalBody>
            <ModalFooter className="bg-white justify-end rounded-xl mb-6 mt-6 py-0">
              <div className="flex gap-4">
                <Button color="primary" onClick={onClose} className="font-bold">
                  {cancelButtonText}
                </Button>
                <Button
                  variant="bordered"
                  onClick={onConfirm}
                  className="font-bold"
                  startContent={confirmButtonStartContent}
                >
                  {confirmButtonText}
                </Button>
              </div>
            </ModalFooter>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
