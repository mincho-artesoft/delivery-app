export const ADMIN_PANEL_SETTINGS = {
  pages: [

    // WAREHOUSE

    {
      path: 'warehouse',
      title: 'Warehouse',
      className: 'col-2xl-2 col-md-6 col-xs-11',
      yGet: { interpolate: '/service?path=${serviceGuid}' },
      separator: null,
      showHeaders: true,
      menuView: {
        'name': 'Warehouse',
        'icon': 'storage',
        'tooltip': 'Warehouse',
        'label': 'Warehouse',
        'path': '/warehouse',
      },
      navbar: {
        buttons: [
          {
            label: 'Add product',
            action: 'create',
            path: 'warehouse.edit',
            openSidenav: true,
            color: 'accent',
            active: true,
            icon: 'add_box'
          },
        ],
      },
      columns: [
        {
          data: 'guid',
          title: 'Id',
          readOnly: true
        },
        {
          data: 'product',
          title: 'Product',
        },
        {
          data: 'quantity',
          title: 'Quantity',
        },
        {
          data: 'metrics',
          title: 'Metrics',
        },
        {
          data: 'validTo',
          title: 'Valid to',
        }

      ]
    },
    {
      path: 'warehouse.edit',
      title: 'Add Product',
      yGet: { interpolate: '/service?path=${serviceGuid}' },
      navbar: {
        reversed: true,
        buttons: [
          {
            label: 'Close',
            action: 'close',
            icon: 'close',
            active: true
          },
          {
            label: 'Save',
            action: 'save',
            icon: 'check',
            active: true,
            yPost: { path: '/services', guid: '${serviceGuid}' },
            addProduct: true
          },
        ]
      },
      columns: [
        {
          data: 'guid',
          title: 'Id',
          className: 'col-2xl-12 col-md-12 col-xs-12',
        },
        {
          data: 'product',
          title: 'Product',
          className: 'col-2xl-6 col-md-6 col-xs-12',
        },
        {
          data: 'quantity',
          title: 'Quantity',
          className: 'col-2xl-6 col-md-6 col-xs-12',
        },
        {
          data: 'metrics',
          title: 'Metrics',
          className: 'col-2xl-6 col-md-6 col-xs-12',
        },
        {
          data: 'validTo',
          title: 'Valid to',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          editor: 'dateEditor'

        }
      ]
    },

    //ORGANIZATIONS

    {
      path: 'organizations',
      title: 'Organizations',
      className: 'col-2xl-2 col-md-6 col-xs-11',
      yGet: { path: '/organizations' },
      separator: null,
      showHeaders: true,
      navbar: {
        buttons: [
          {
            label: 'Add new',
            action: 'create',
            path: 'organizations.edit',
            openSidenav: true,
            color: 'accent',
            active: true,
            icon: 'add_box'
          },
          {
            label: 'Edit',
            action: 'edit',
            path: 'organizations.edit',
            color: 'primary',
            openSidenav: true,
            icon: 'create',
            active: true,
            default: true
          },
          {
            label: 'Edit services',
            action: 'services',
            path: 'organizations.services',
            color: '',
            openSidenav: true,
            icon: 'playlist_add',
            active: true,
            default: true
          },
          {
            label: 'Delete',
            action: 'delete',
            isDialog: true,
            active: true,
            icon: 'delete',
            color: 'warn',
            deletePath: '/organization?path=${_id}',
            message: 'Restaurant with ${_id} was successfully deleted'
          }
        ],
      },
      columns: [
        {
          data: '_id',
          title: 'ID',
          sortable: true,
          width: 80,
        },
        {
          data: 'img',
          title: 'Picture',
        },
        {
          data: 'name',
          title: 'Name restaurant',
          renderer: 'objectRenderer',
          label: '${controls.name.value.${controls.language.value}}',
        },
        {
          data: 'deliveryTime',
          title: 'Delivery time',
        },
        {
          data: 'domain',
          title: 'Domain',
        },
        {
          data: 'eik',
          title: 'EIK',
        },
        {
          data: 'phoneNumber',
          title: 'Phone number',
          editor: {
            editorIcon: 'edit',
            editorColor: 'primary',
            actionButton: {
              icon: 'send',
              color: 'warn',
              action: 'save',
              yPost: '${id}.{userID}.organization'
            },
            name: 'FastEditor',
            message: 'Item with ${name} was succesfully updated'
          }
        },
        {
          data: 'freeShipping',
          title: 'Free shipping',
        },
        {
          data: 'addresses',
          title: 'Addresses',
        },
        {
          data: 'tags',
          title: 'tags',
          width: 160,
        }
        ,
        {
          data: 'workingDays',
          title: 'Working days',
        }
        ,
        {
          data: 'workingHours',
          title: 'Working hours',
        }

      ]
    },
    {
      path: 'organizations.edit',
      title: 'Restaurants Edit',
      navbar: {
        reversed: true,
        buttons: [

          {
            label: 'Close',
            action: 'close',
            icon: 'close',
            active: true
          },
          {
            label: 'Save',
            action: 'save',
            icon: 'check',
            active: true,
            yPost: '/organization?path=${lastSelectedRow._id}',
            createServices: true
          },
        ]
      },
      yGet: { interpolate: '/organization?path=${lastSelectedRow._id}' },
      columns: [
        {
          data: 'language',
          editor: 'hidden'
        },
        {
          data: '_id',
          title: 'id',
          readOnly: true,
          className: 'col-2xl-12 col-md-12 col-xs-12',
        },
        {
          data: 'languages',
          showTabs: true,
          editor: 'multiLang',
        },
        {
          data: 'name',
          title: 'Name',
          controlType: 'BaseExtendedFormGroup',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
          ],
          editor: 'langLinked'
        },
        {
          data: 'domain',
          title: 'Domain',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' }
          ]
        },
        {
          data: 'tags',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Tags',
          default: [],
          editor: 'chipListEditor'
        },
        {
          data: 'workingHours',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
            { name: 'number' }
          ],
          title: 'Working Hours',

        },
        {
          data: 'workingDays',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
            { name: 'number' }
          ],
          title: 'Working Days',
        },
        {
          data: 'deliveryTime',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Delivery Time',
          validators: [
            { name: 'number' }
          ]
        },
        {
          data: 'freeShipping',
          title: 'Free Shipping',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          default: false,
          editor: 'toggleButton'
        },
        {
          data: 'eik',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'EIK',
          validators: [
            { name: 'number' },
            { name: 'required' }
          ]
        },
        {
          data: 'langRequired',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Language required',
          validators: [
            { name: 'required' },

          ]
        },
        {
          data: 'langOptional',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Language Optional',
        },
        {
          data: 'address.country',
          title: 'Country',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' }
          ]
        },
        {
          data: 'address.state',
          title: 'State',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
          ]
        },
        {
          data: 'address.city',
          title: 'City',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' }
          ]
        },
        {
          data: 'address.street',
          title: 'Street',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' }
          ]
        },
        {
          data: 'address.zipCode',
          title: 'ZIP Code',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
            { name: 'number' }
          ]
        },
        {
          data: 'address.location.latitude',
          title: 'Latitude',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
            {
              name: 'pattern', arg: "-?(90(\\.0{1,6})?|[1-8]?\\d(\\.\\d{1,6})?|\\d(\\.\\d{1,6})?)"
            }
          ]
        },
        {
          data: 'address.location.longitude',
          title: 'Longtitude',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
            {
              name: 'pattern', arg: "-?((\\d{1,2}|1[0-7]\\d)(\\.\\d{1,6})?|180(\\.0{1,6})?)"
            }
          ]
        },
        {
          data: 'phoneNumber',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Phone Number',
          validators: [
            { name: 'number' },
            { validator: 'required' }
          ]
        },
        {
          data: 'created_at',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Created on',
          readOnly: true,
        },
        {
          data: 'updated_at',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Last Updated at',
          readOnly: true
        }
      ]
    },
    {
      path: 'organizations.services',
      title: 'Add or remove services',
      navbar: {
        reversed: true,
        buttons: [

          {
            label: 'Close',
            action: 'close',
            icon: 'close',
            active: true
          },
          // {
          //   label: 'Save',
          //   action: 'save',
          //   icon: 'check',
          //   active: true,
          //   yPost: '${id}.{userID}.organization'
          // },
        ]
      },
      yGet: { interpolate: '/organization?path=${lastSelectedRow._id}' },
      columns: [
        {
          data: 'services',
          className: 'col-2xl-12 col-md-12 col-xs-12',
          controlType: 'BaseExtendedFormGroup',
          columns: [
            {
              data: 'warehouse',
              title: 'Warehouse',
              default: 'base',
              validators: [{ name: 'required' }],
              options: [
                {
                  name: 'Basic Subscription',
                  description: {
                    subtitle: 'Ideal for Small Scale Operations',
                    usage: 'Inventory Limit: Manage up to 10 items.',
                    features: [
                      'Real-time inventory tracking for a concise product range.',
                      'Basic analytics for inventory optimization.',
                      'Access to essential warehouse management tools.',
                      'Email support for queries and troubleshooting.'
                    ],
                    hint: '*Best for: Small businesses or startups with a limited range of products.'
                  },
                  value: 'base'
                },
                {
                  name: 'Extended Subscription',
                  description: {
                    subtitle: 'Perfect for Growing Businesses',
                    usage: 'Inventory Limit: Handle up to 30 items.',
                    features: [
                      'All Basic features included.',
                      'Enhanced analytics with trend insights.',
                      'Multi-user access for team collaboration.',
                      'Priority email and chat support.'
                    ],
                    hint: '*Best For: Medium-sized businesses experiencing growth and diversifying their product range.'
                  },
                  value: 'extended'
                },
                {
                  name: 'Full Subscription',
                  description: {
                    subtitle: 'Ultimate Solution for Large Operations',
                    usage: 'Inventory Limit: Unlimited items management.',
                    features: [
                      'All Extended features included.',
                      'Advanced inventory forecasting tools.',
                      'Integration capabilities with other business systems (CRM, ERP).',
                      'Dedicated account manager and 24/7 support.'
                    ],
                    hint: '*Best For: Large enterprises or rapidly expanding businesses needing comprehensive and scalable inventory solutions.'
                  },
                  value: 'full'
                }
              ]
            },
            {
              data: 'humanResources',
              title: 'Human Resources',
              default: 'base',
              validators: [{ name: 'required' }],
              options: [
                {
                  name: 'HR - Max employees to 10',
                  description: {
                    subtitle: 'Efficient for Small Teams',
                    usage: 'Maximum Employees: Up to 10.',
                    features: [
                      'Basic HR management tools.',
                      'Employee records and attendance tracking.',
                      'Standard reporting capabilities.',
                      'Email support for HR queries.'
                    ],
                    hint: '*Ideal for: Small businesses or teams with up to 10 employees.'
                  },
                  value: 'base'
                },
                {
                  name: 'HR - Max employees from 10 to 30',
                  description: {
                    subtitle: 'Optimized for Medium-sized Teams',
                    usage: 'Maximum Employees: 10 to 30.',
                    features: [
                      'Enhanced HR management tools.',
                      'Advanced employee scheduling and time tracking.',
                      'Customizable reports and analytics.',
                      'Priority email and chat support.'
                    ],
                    hint: '*Suitable for: Growing businesses with 10 to 30 employees.'
                  },
                  value: 'extended'
                },
                {
                  name: 'HR - Max employees - unlimited',
                  description: {
                    subtitle: 'Comprehensive for Large Enterprises',
                    usage: 'Maximum Employees: Unlimited.',
                    features: [
                      'Full-suite HR management system.',
                      'Automated payroll and benefits administration.',
                      'In-depth analytics and predictive insights.',
                      'Dedicated HR support and consultation.'
                    ],
                    hint: '*Best For: Large enterprises or organizations with a large number of employees.'
                  },
                  value: 'full'
                }
              ]
            }
          ],
          editor: 'servicesEditor'
        }
      ]
    },

    // EMPLOYEES

    {
      path: 'employees',
      title: 'Employees',
      className: 'col-2xl-2 col-md-6 col-xs-11',
      yGet: { interpolate: '/profiles?path=${selectedOrganization._id}' },
      separator: null,
      showHeaders: true,
      navbar: {
        buttons: [
          {
            label: 'Add new',
            action: 'create',
            path: 'employees.edit',
            openSidenav: true,
            color: 'accent',
            active: true,
            icon: 'add_box',
          },
          {
            label: 'Edit',
            action: 'edit',
            path: 'employees.edit',
            color: 'primary',
            openSidenav: true,
            icon: 'create',
            active: true,
            default: true

          },
          {
            label: 'Delete',
            action: 'delete',
            isDialog: true,
            active: true,
            icon: 'delete',
            color: 'warn',
            deletePath: '`/profiles?path=${_id}`',
            message: 'Employee with ${_id} was successfully deleted'
          }
        ],
      },
      columns: [
        {
          data: '_id',
          title: 'ID',
          sortable: true,
          width: 80,
        },
        {
          data: 'email',
          title: 'Email',
        },
        {
          data: 'img',
          title: 'Picture',
        },
        {
          data: 'name',
          title: 'Name',
        },
        {
          data: 'surName',
          title: 'Surname',
        },
        {
          data: 'lastName',
          title: 'Lastname',
        },
        {
          data: 'position',
          title: 'Position',
        },

      ]
    },
    {
      path: 'employees.edit',
      title: 'Employee Edit',
      className: 'col-2xl-2 col-md-6 col-xs-11',
      yGet: { interpolate: '/employees?path=${lastSelectedRow._id}' },
      separator: null,
      showHeaders: true,
      navbar: {
        reversed: true,
        buttons: [
          {
            label: 'Close',
            action: 'close',
            icon: 'close',
            active: true
          },
          {
            label: 'Save',
            action: 'save',
            icon: 'check',
            active: true,
            http: { path: "http://localhost:80/api/invite-user" }
          }
        ],
      },
      columns: [
        {
          data: '_id',
          title: 'ID',
          readOnly: true,
          className: 'col-2xl-6 col-md-6 col-xs-12',
        },
        {
          data: 'email',
          title: 'Email',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'email' },
            { validator: 'required' }
          ]
        },
        {
          data: 'img',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Picture',
          autodisable: '_id'
        },
        {
          data: 'name',
          title: 'Name',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          autodisable: '_id',
          validators: [
            { validator: 'required' }
          ]
        },
        {
          data: 'position',
          title: 'Position',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          autodisable: '_id',
          validators: [
            { validator: 'required' }
          ]
        },
      ]
    },

    // TEAMS

    {
      path: 'teams',
      title: 'Teams',
      className: 'col-2xl-2 col-md-6 col-xs-11',
      yGet: { interpolate: '/teams?path=${selectedOrganization._id}' },
      menuView: {
        'name': 'Teams',
        'icon': 'storage',
        'tooltip': 'Teams',
        'label': 'Teams',
        'path': '/teams',
        group: {
          prop: 'teams',
        }
      },
      showHeaders: true,
      multipleView: [
        {
          view: 'table',
          label: 'Table',
          icon: 'view_list'
        },
        {
          view: 'cardView',
          label: 'Cards',
          icon: 'view_module'
        }
      ],
      navbar: {
        buttons: [
          {
            label: 'Create team',
            action: 'create',
            path: 'teams.edit',
            openSidenav: true,
            color: 'accent',
            active: true,
            icon: 'add_box'
          },
          {
            label: 'Edit team',
            action: 'edit',
            path: 'teams.edit',
            color: 'primary',
            openSidenav: true,
            icon: 'create',
            active: true
          },
          {
            label: 'Delete Team',
            action: 'delete',
            isDialog: true,
            active: true,
            icon: 'delete',
            color: 'warn',
            deletePath: '/organization?path=${_id}',
            message: 'Team with ${_id} was successfully deleted'
          },


        ],
      },
      columns: [
        {
          data: '_id',
          title: 'ID'
        }
      ],
      component: {
        name: 'TeamsComponent',
        template: {
          buttons: [
            {
              label: 'Join',
              action: 'edit',
              path: 'organizations.edit',
              color: 'primary',
              icon: 'link',
              active: true
            },
            {
              label: 'Leave',
              action: 'edit',
              path: 'organizations.edit',
              color: 'warn',
              icon: 'exit_to_app',
              active: true
            }
          ]


        }

      }
    },

    {
      path: 'teams.edit',
      title: 'Team Edit',
      className: 'col-2xl-2 col-md-6 col-xs-11',
      yGet: { path: '/team?path={id}' },
      separator: null,
      showHeaders: true,
      navbar: {
        reversed: true,
        buttons: [
          {
            label: 'Close',
            action: 'close',
            icon: 'close',
            active: true
          },
          {
            label: 'Save',
            action: 'save',
            icon: 'check',
            active: true,
            yPost: '/teams?path=${selectedOrganization._id}'
          }
        ],
      },
      columns: [
        {
          data: '_id',
          title: 'ID',
          readOnly: true,
          className: 'col-2xl-6 col-md-6 col-xs-12',
        },

        {
          data: 'name',
          title: 'Name',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { validator: 'required' }
          ]
        },
      ]
    }
  ]
}