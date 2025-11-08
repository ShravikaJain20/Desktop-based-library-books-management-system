#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Customer
{
  int id;
  char name[50];
  char phone[20];
  char email[50];
};

void addCustomer();
void searchCustomer();
void deleteCustomer();
void menu();

int main()
{
  menu();
  return 0;
}

void menu()
{
  int choice;
  while (1)
  {
    printf("\n====== CUSTOMER MANAGEMENT SYSTEM ======\n");
    printf("1. Add Customer\n");
    printf("2. Search Customer by ID\n");
    printf("3. Delete Customer by ID\n");
    printf("4. Exit\n");
    printf("========================================\n");
    printf("Enter your choice: ");
    scanf("%d", &choice);

    switch (choice)
    {
    case 1:
      addCustomer();
      break;
    case 2:
      searchCustomer();
      break;
    case 3:
      deleteCustomer();
      break;
    case 4:
      printf("Exiting... Bye!\n");
      exit(0);
    default:
      printf("Invalid choice! Try again.\n");
    }
  }
}

void addCustomer()
{
  struct Customer c;
  FILE *fp = fopen("customer.dat", "ab");
  if (!fp)
  {
    printf("Error opening file!\n");
    return;
  }

  printf("\nEnter Customer ID: ");
  scanf("%d", &c.id);
  getchar(); // consume newline
  printf("Enter Name: ");
  fgets(c.name, sizeof(c.name), stdin);
  c.name[strcspn(c.name, "\n")] = 0;
  printf("Enter Phone Number: ");
  fgets(c.phone, sizeof(c.phone), stdin);
  c.phone[strcspn(c.phone, "\n")] = 0;
  printf("Enter Email: ");
  fgets(c.email, sizeof(c.email), stdin);
  c.email[strcspn(c.email, "\n")] = 0;

  fwrite(&c, sizeof(c), 1, fp);
  fclose(fp);
  printf("\nCustomer added successfully!\n");
}

void searchCustomer()
{
  int id, found = 0;
  struct Customer c;
  FILE *fp = fopen("customer.dat", "rb");
  if (!fp)
  {
    printf("No records found! Add customers first.\n");
    return;
  }

  printf("\nEnter Customer ID to search: ");
  scanf("%d", &id);

  while (fread(&c, sizeof(c), 1, fp))
  {
    if (c.id == id)
    {
      printf("\nCustomer Found:\n");
      printf("ID: %d\n", c.id);
      printf("Name: %s\n", c.name);
      printf("Phone: %s\n", c.phone);
      printf("Email: %s\n", c.email);
      found = 1;
      break;
    }
  }
  if (!found)
    printf("Customer with ID %d not found!\n", id);

  fclose(fp);
}

void deleteCustomer()
{
  int id, found = 0;
  struct Customer c;
  FILE *fp = fopen("customer.dat", "rb");
  FILE *temp = fopen("temp.dat", "wb");

  if (!fp)
  {
    printf("No records found! Add customers first.\n");
    return;
  }

  printf("\nEnter Customer ID to delete: ");
  scanf("%d", &id);

  while (fread(&c, sizeof(c), 1, fp))
  {
    if (c.id == id)
    {
      found = 1;
      printf("Customer with ID %d deleted successfully!\n", id);
    }
    else
    {
      fwrite(&c, sizeof(c), 1, temp);
    }
  }

  fclose(fp);
  fclose(temp);

  remove("customer.dat");
  rename("temp.dat", "customer.dat");

  if (!found)
    printf("Customer with ID %d not found!\n", id);
}
