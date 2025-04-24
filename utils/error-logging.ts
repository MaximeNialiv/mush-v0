import * as Sentry from "@sentry/nextjs";

/**
 * Utilitaire pour capturer et enregistrer les erreurs avec Sentry
 */
export const ErrorLogging = {
  /**
   * Capturer une erreur avec des informations contextuelles
   * @param error L'erreur à capturer
   * @param context Informations contextuelles supplémentaires
   */
  captureError: (error: Error | unknown, context?: Record<string, any>) => {
    console.error("Erreur capturée:", error);
    
    if (error instanceof Error) {
      Sentry.captureException(error, {
        contexts: {
          custom: context || {}
        }
      });
    } else {
      Sentry.captureMessage(`Erreur non standard: ${JSON.stringify(error)}`, {
        level: "error",
        contexts: {
          custom: context || {}
        }
      });
    }
  },

  /**
   * Enregistrer un message informatif
   * @param message Le message à enregistrer
   * @param level Le niveau de gravité (info, warning, error)
   * @param context Informations contextuelles supplémentaires
   */
  logMessage: (
    message: string, 
    level: "info" | "warning" | "error" = "info", 
    context?: Record<string, any>
  ) => {
    console.log(`[${level.toUpperCase()}] ${message}`);
    
    Sentry.captureMessage(message, {
      level: level as Sentry.SeverityLevel,
      contexts: {
        custom: context || {}
      }
    });
  },

  /**
   * Configurer les informations utilisateur pour Sentry
   * @param user Informations sur l'utilisateur
   */
  setUser: (user: { id: string; email?: string; username?: string }) => {
    Sentry.setUser(user);
  },

  /**
   * Effacer les informations utilisateur
   */
  clearUser: () => {
    Sentry.setUser(null);
  }
};

/**
 * Wrapper pour capturer les erreurs dans les fonctions asynchrones
 * @param fn Fonction à exécuter
 * @param errorContext Contexte à ajouter en cas d'erreur
 * @returns Résultat de la fonction ou null en cas d'erreur
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorContext?: Record<string, any>
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    ErrorLogging.captureError(error, errorContext);
    return null;
  }
}
