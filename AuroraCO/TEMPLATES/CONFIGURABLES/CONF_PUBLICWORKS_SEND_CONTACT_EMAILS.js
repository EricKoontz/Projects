{
  "PublicWorks/Real Property/License Agreement/NA": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "To run automated script based on JSON rules",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Completeness Check"
          ],
          "status": [
            "Complete"
          ],
          "customFields": {
            "Review Fee?": "Yes"
          }
        },
        "action": {
          "notificationTemplate": "TEST_FOR_SCRIPTS",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      },
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "Script 333",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Completeness Check"
          ],
          "status": [
            "Incomplete"
          ]
        },
        
        "action": {
          "notificationTemplate": "PW LICENSE AG INCOMPLETE COMPLETENESS CHECK # 333 A",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant",
	    "Project Owner"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      },
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "Script 333",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Completeness Check"
          ],
          "status": [
            "Ready to Pay"
          ],
           "customFields": {
            "Review Fee?": "Yes"
          }
        },
        "action": {
          "notificationTemplate": "PW LICENSE AG INCOMPLETE COMPLETENESS CHECK # 333 B",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant",
	    "Project Owner"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      },
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "Script #334",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Plans Coordination"

          ],
          "status": [
            "Ready for Signatures"
          ]
        },
        "action": {
          "notificationTemplate": "PW LICENSE AGREEMENT READY FOR SIG #334",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      },
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "To validate record based on JSON rules",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Recordation"
          ],
          "status": [
            "Recorded"
          ]
        },
        "action": {
          "notificationTemplate": "TEST_FOR_SCRIPTS",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      }
    ]
  },
  "PublicWorks/Public Improvement/Permit/NA": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "To validate record based on JSON rules. Script 168",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Verify Testing Approved"
          ],
          "status": [
            "Approved"
          ]
        },
        "action": {
          "notificationTemplate": "PW PI TESTING VERIFICATION - APPROVED # 168",
          "notificationReport": "",
          "notifyContactTypes": [
            "ALL"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      },
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "To validate record based on JSON rules. Script 168",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Verify Testing Approved"
          ],
          "status": [
            "Rejected", "Additional Testing Required"
          ]
        },
        "action": {
          "notificationTemplate": "PW PI TESTING VERIFICATION - REJECTED # 168",
          "notificationReport": "",
          "notifyContactTypes": [
            "ALL"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      },
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "Script 167",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Initial Acceptance"
          ],
          "status": [
            "Complete"
          ]
        },
        "action": {
          "notificationTemplate": "PI INITIAL ACCEPTANCE # 167",
          "notificationReport": "",
          "notifyContactTypes": [
            "ALL"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      },
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "Script 383",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Fee Processing"
          ],
          "status": [
            "Ready to Pay"
          ]
        },
        "action": {
          "notificationTemplate": "PW READY TO PAY #123",
          "notificationReport": "",
          "notifyContactTypes": [
            "Contractor(s)"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      }
    ]
  },
  "PublicWorks/Real Property/Easement/NA": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "To validate record based on JSON rules",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Recordation"
          ],
          "status": [
            "Recorded"
          ]
        },
        "action": {
          "notificationTemplate": "PW SUB PLAT RECORDED # 289",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      }
    ]
  },
  "PublicWorks/Traffic/Traffic Engineering Request/NA": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "To validate record based on JSON rules",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Work Order To Traffic OPS"
          ],
          "status": [
            "Completed"
          ]
        },
        "action": {
          "notificationTemplate": "TEST_FOR_SCRIPTS",
          "notificationReport": "",
          "notifyContactTypes": [
            "None"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            "abunce@auroragov.org"
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      }
    ]
  },
  "PublicWorks/Pavement Design/*/*": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "Script 123",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Quality Check"
          ],
          "status": [
            "Ready to Pay"
          ]
        },
        "action": {
          "notificationTemplate": "PW READY TO PAY #123",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant",
            "Project Owner"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            ""
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      },
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "Script 402",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Plans Coordination"
          ],
          "status": [
            "Resubmittal Requested"
          ]
        },
        "action": {
          "notificationTemplate": "PW PLANS COORDINATION EMAILS RESUBMITTAL REQUESTED #402",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            ""
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      },
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "Script 402",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Plans Coordination"
          ],
          "status": [
            "SS Requested"
          ]
        },
        "action": {
          "notificationTemplate": "PW PLANS COORDINATION EMAILS SS REQUESTED #402",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            ""
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      },
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "Script 402",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Plans Coordination"
          ],
          "status": [
            "Approved"
          ]
        },
        "action": {
          "notificationTemplate": "PW PLANS COORDINATION EMAILS APPROVED #402",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant",
            "Project Owner"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            ""
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      }
    ]
  },
  "PublicWorks/Drainage/*/*": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "Script 123",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Quality Check"
          ],
          "status": [
            "Ready to Pay"
          ]
        },
        "action": {
          "notificationTemplate": "PW READY TO PAY #123",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant",
            "Project Owner"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            ""
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      },
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "Script 402",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Plans Coordination"
          ],
          "status": [
            "Resubmittal Requested",
            "SS Requested"
          ]
        },
        "action": {
          "notificationTemplate": "PW PLANS COORDINATION EMAILS #402",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            ""
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      },
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "Script 402",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Plans Coordination"
          ],
          "status": [
            "Approved"
          ]
        },
        "action": {
          "notificationTemplate": "PW PLANS COORDINATION EMAILS #402",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant",
            "Project Owner"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            ""
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      }
    ]
  },
  "PublicWorks/Civil Plan/*/*": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "Script 123",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Quality Check"
          ],
          "status": [
            "Ready to Pay"
          ]
        },
        "action": {
          "notificationTemplate": "PW READY TO PAY #123",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant",
            "Project Owner"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            ""
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      },
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "Script 402",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Plans Coordination"
          ],
          "status": [
            "Resubmittal Requested",
            "SS Requested"
          ]
        },
        "action": {
          "notificationTemplate": "PW PLANS COORDINATION EMAILS #402",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            ""
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      },
      {
        "preScript": "",
        "postScript": "",
        "metadata": {
          "description": "Script 402",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Plans Coordination"
          ],
          "status": [
            "Approved"
          ]
        },
        "action": {
          "notificationTemplate": "PW PLANS COORDINATION EMAILS #402",
          "notificationReport": "",
          "notifyContactTypes": [
            "Applicant",
            "Project Owner"
          ],
          "url4ACA": "",
          "fromEmail": "noreply@auroraco.gov",
          "additionalEmailsTo": [
            ""
          ],
          "createFromParent": "",
          "reportingInfoStandards": ""
        }
      }
    ]
  }
}