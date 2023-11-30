export const ADMIN_PANEL_SETTINGS = {
  pages: [
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
            active: true
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
      path: 'employees',
      title: 'Employees',
      className: 'col-2xl-2 col-md-6 col-xs-11',
      yGet: { path: '/organizations', prop: 'profile', key: 'employeeData'},
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
            icon: 'add_box'
          },
          {
            label: 'Edit',
            action: 'edit',
            path: 'employees.edit',
            color: 'primary',
            openSidenav: true,
            icon: 'create',
            active: true
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
      yGet: { path: '/organizations', prop: 'employees', id: true },
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
            yPost: '${id}.{userID}.organization'
          }
        ],
      },
      columns: [
        {
          data: '_id',
          title: 'ID',
          readOnly: true,
          width: 80,
        },
        {
          data: 'img',
          title: 'Picture',
        },
        {
          data: 'name',
          title: 'Name',
          validators: [
            { validator: 'required' }
          ]
        },
        {
          data: 'position',
          title: 'Position',
          validators: [
            { validator: 'required' }
          ]
        },
        {
          data: 'email',
          title: 'Email',
          validators: [
            { name: 'email' },
            { validator: 'required' }
          ]
        }
      ]
    },
    {
      path: 'teams',
      title: 'Teams',
      className: 'col-2xl-2 col-md-6 col-xs-11',
      yGet: { path: '/organizations' },
      showHeaders: false,
      notTable: true,
      navbar: {
        buttons: [
          {
            label: 'Add new member',
            action: 'create',
            path: 'organizations.edit',
            openSidenav: true,
            color: 'accent',
            active: true,
            icon: 'add_box'
          },
          {
            label: 'Join team',
            action: 'edit',
            path: 'organizations.edit',
            color: 'primary',
            openSidenav: true,
            icon: 'create',
            active: true
          },
          {
            label: 'Remove member',
            action: 'delete',
            isDialog: true,
            active: true,
            icon: 'delete',
            color: 'warn',
            deletePath: '/organization?path=${_id}',
            message: 'Restaurant with ${_id} was successfully deleted'
          },
          {
            label: 'Leave team',
            action: 'edit',
            path: 'organizations.edit',
            color: 'primary',
            openSidenav: true,
            icon: 'create',
            active: true
          }

        ],
      },
      columns: [
      ],
      template: 'teamsComponent'
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
            yPost: '${id}.{userID}.organization'
          },
        ]
      },
      yGet: { path: '/organization?path=${_id}' },
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
      path: 'warehouse',
      title: 'Warehouse',
      className: 'col-2xl-2 col-md-6 col-xs-11',
      yGet: { path: '/warehouses' },
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
            label: 'Add new',
            action: 'create',
            path: 'warehouse.edit',
            openSidenav: true,
            color: 'accent',
            active: true,
            icon: 'add_box'
          },
          {
            label: 'Edit',
            action: 'edit',
            path: 'warehouse.edit',
            color: 'primary',
            openSidenav: true,
            icon: 'create',
            active: true
          },
          {
            label: 'Delete',
            action: 'delete',
            isDialog: true,
            active: true,
            icon: 'delete',
            color: 'warn',
            deletePath: 'https://06hbbmv516.execute-api.eu-central-1.amazonaws.com/api/warehouse/warehouse/${_id}',
            message: 'Warehouse with ${_id} was successfully deleted'
          }
        ],
      },
      columns: [
        {
          data: '_id',
          title: 'Id',
          width: 80,
        },
        {
          data: 'name',
          title: 'Name',
          renderer: 'objectRenderer',
          label: '${controls.name.value.${controls.language.value}}',
          width: 120,
        },
        {
          data: 'brand_name',
          title: 'Brand Name',
        },
        {
          data: 'description',
          title: 'Description',
          renderer: 'objectRenderer',
          label: '${controls.description.value.${controls.language.value}}',
          className: 'description',
        },
        {
          data: 'unit',
          title: 'Unit',
        },
        {
          data: 'quantity',
          title: 'Quantity',
        },
        {
          data: 'tags',
          title: 'Tags',
        },
        {
          data: 'price',
          title: 'Price',
        },
        {
          data: 'currentProducts',
          title: 'Current Products',
          renderer: 'objectRenderer',
          label: '${controls.quantity.value}-${controls.expirationDate.value}',
        },
        {
          data: 'ingredients',
          title: 'Ingredients',
          renderer: 'objectRenderer',
          label: '${controls.quantity.value}-${controls.productId.value}',
        },
        {
          data: 'images',
          title: 'Images',
        }
        ,
        {
          data: 'createdAt',
          title: 'CreatedAt',
        }
        ,
        {
          data: 'updatedAt',
          title: 'UpdatedAt',
        }

      ]
    },
    {
      path: 'warehouse.edit',
      title: 'Warehouses Edit',
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
            yPost: ''
          },
        ]
      },
      columns: [
        {
          data: '_id',
          title: 'Id',
          readOnly: true,
          className: 'col-2xl-12 col-md-12 col-xs-12',
        },
        {
          data: 'language',
          editor: 'hidden'
        },
        {
          data: 'languages',
          showTabs: true,
          className: 'col-2xl-6 col-md-6 col-xs-12',
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
          data: 'description',
          title: 'Description',
          controlType: 'BaseExtendedFormGroup',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          validators: [
            { name: 'required' },
          ],
          editor: 'langLinked'
        },
        {
          data: 'brand_name',
          title: 'Brand Name',
          className: 'col-2xl-6 col-md-6 col-xs-12',
        },
        {
          data: 'unit',
          title: 'Unit',
          className: 'col-2xl-6 col-md-6 col-xs-12',
        },
        {
          data: 'quantity',
          title: 'Quantity',
          className: 'col-2xl-6 col-md-6 col-xs-12',
        },
        {
          data: 'tags',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Tags',
          default: [],
          editor: 'chipListEditor'
        },
        {
          data: 'price',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          title: 'Price',
        },
        {
          data: 'currentProducts',
          title: 'Current Products',
          renderer: 'objectRenderer',
          label: '${quantity}-${expirationDate}',
          className: 'col-2xl-6 col-md-6 col-xs-12',
        },
        {
          data: 'ingredients',
          title: 'Ingredients',
          renderer: 'objectRenderer',
          label: '${quantity}-${productId}',
          className: 'col-2xl-6 col-md-6 col-xs-12',
        },
        {
          data: 'images',
          title: 'Images',
          className: 'col-2xl-6 col-md-6 col-xs-12',
        }
        ,
        {
          data: 'createdAt',
          title: 'CreatedAt',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          readOnly: true,
        }
        ,
        {
          data: 'updatedAt',
          title: 'UpdatedAt',
          className: 'col-2xl-6 col-md-6 col-xs-12',
          readOnly: true,
        }

      ]
    },

  ]
}