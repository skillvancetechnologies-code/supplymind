BASELINE_AUC = 0.8736

PSI_THRESHOLD = 0.20

AUC_THRESHOLD = BASELINE_AUC * 0.95


def check_auc(current_auc):

    if current_auc < AUC_THRESHOLD:
        return "RETRAIN"

    return "STABLE"


def check_psi(psi):

    if psi > PSI_THRESHOLD:
        return "ALERT"

    return "STABLE"
