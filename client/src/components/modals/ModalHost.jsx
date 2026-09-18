import { useSelector } from 'react-redux';
import { WithdrawModal } from './WithdrawModal.jsx';
import { RecruiterPreviewModal } from './RecruiterPreviewModal.jsx';
import { DeleteAccountModal } from './DeleteAccountModal.jsx';
import { UploadModal } from './UploadModal.jsx';
import { DocPreviewModal } from './DocPreviewModal.jsx';
import { SignatureModal } from './SignatureModal.jsx';
import { DeclineOfferModal } from './DeclineOfferModal.jsx';

// One mount point for every Redux-driven modal. Screens dispatch openModal and
// never render a dialog themselves.
const REGISTRY = {
  withdraw: WithdrawModal,
  recruiterPreview: RecruiterPreviewModal,
  deleteAccount: DeleteAccountModal,
  upload: UploadModal,
  docPreview: DocPreviewModal,
  signature: SignatureModal,
  declineOffer: DeclineOfferModal
};

export const ModalHost = () => {
  const modal = useSelector((s) => s.ui.modal);
  const Current = modal ? REGISTRY[modal] : null;
  return Current ? <Current /> : null;
};
